import { useState, useEffect, useMemo } from "react"
import { useWorkoutStore } from "../store/useWorkoutStore"
import type { WeekDay } from "../models/types"
import CircleProgress from "../utils/CircleProgress"

const weekDays: WeekDay[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
]

export default function ExecuteRoutine() {

  const {
  weeklyPlan,
  activeWorkout,
  objectives,
  history,
  startWorkout,
  confirmSet,
  finalizeWorkout,
  resetActiveWorkout,
  planWeeks
} = useWorkoutStore()

  const [weight, setWeight] = useState("")
  const [note, setNote] = useState("")

  const todayIndex = new Date().getDay()
  const today: WeekDay =
    weekDays[todayIndex === 0 ? 6 : todayIndex - 1]

  const routine = weeklyPlan[today]

  const planEnd = new Date()

planEnd.setDate(
  planEnd.getDate() + planWeeks * 7
)

const lastPlanDay =
  planWeeks > 0
    ? new Date(
        Date.now() + planWeeks * 7 * 86400000
      ).toISOString().slice(0,10)
    : "-"

  /* ============================= */
  /* RESET SI CAMBIA RUTINA */
  /* ============================= */

  useEffect(() => {
    if (
      activeWorkout &&
      routine &&
      activeWorkout.routineId !== routine.id
    ) {
      resetActiveWorkout()
    }
  }, [activeWorkout, routine, resetActiveWorkout])

  /* ============================= */
  /* CÁLCULO GLOBAL CÍRCULO */
  /* ============================= */

  const activeExerciseIds = useMemo(() => {
    return Object.values(weeklyPlan || {})
      .flatMap(r => r?.exercises ?? [])
      .map(e => e.id)
  }, [weeklyPlan])

  const activeObjectives = useMemo(() => {
    return objectives.exercises.filter(e =>
      activeExerciseIds.includes(e.exerciseId)
    )
  }, [objectives, activeExerciseIds])

  const initialVolume = useMemo(() => {
    return activeObjectives.reduce(
      (acc, ex) =>
        acc +
        ex.baselineWeights.reduce(
          (a: number, b: number) => a + (b || 0),
          0
        ),
      0
    )
  }, [activeObjectives])

  const objectiveVolume = useMemo(() => {
    return activeObjectives.reduce(
      (acc, ex) =>
        acc +
        ex.objectiveWeights.reduce(
          (a: number, b: number) => a + (b || 0),
          0
        ),
      0
    )
  }, [activeObjectives])

  const accumulatedProgress =
    objectives.accumulatedProgress || 0

  const todayProgress =
    objectives.todayProgress || 0

  const previousProgress =
    accumulatedProgress - todayProgress

    const goalCompleted =
  objectiveVolume > 0 &&
  accumulatedProgress + initialVolume >= objectiveVolume

  /* ============================= */
  /* GLOBAL PROGRESS SECTION */
  /* ============================= */

  const GlobalProgressSection = () => (
    <div style={{ marginTop: 10 }}>
      <CircleProgress
        initialVolume={initialVolume}
        accumulatedProgress={accumulatedProgress}
        previousProgress={previousProgress}
        objectiveVolume={objectiveVolume}
      />

      <InfoBlock
        initial={initialVolume}
        progress={accumulatedProgress}
        today={todayProgress}
        objective={objectiveVolume}
      />
    </div>
  )

  /* ============================= */
  /* SIN RUTINA */
  /* ============================= */

  if (!routine) {
    return (
      <div style={containerCenterStyle}>
        No hay rutina asignada.
      </div>
    )
  }

  /* ============================= */
  /* PANTALLA INICIAL */
  /* ============================= */

  if (!activeWorkout) {

    const firstExercise = routine.exercises[0]

    return (


      
      <div style={containerCenterStyle}>

        <div style={initialBlockStyle}>

          <div style={{ marginBottom:10 }}>
  Último día del Plan Actual: {lastPlanDay}
</div>
          <div>Ejercicio 01</div>

          

          <div style={{ marginBottom: 20 }}>
            {firstExercise?.name}
          </div>

          <button
            onClick={() => startWorkout(today)}
            style={startButtonStyle}
          >
            Iniciar
          </button>
        </div>

        <GlobalProgressSection />
      </div>
    )
  }

  /* ============================= */
  /* FINALIZADO */
  /* ============================= */

  const isFinished =
    activeWorkout.currentExerciseIndex ===
    routine.exercises.length

  if (isFinished) {
    return (
      <div style={containerStyle}>

        <textarea
  placeholder={

      goalCompleted
      ? "¡Nuevo ciclo completado!"
    : objectiveVolume === 0
      ? "Para ver Progresos → Ingresa Objetivos en tu Plan  "
      : "Nota del día"
  }
  value={note}
  onChange={(e) => setNote(e.target.value)}
  style={textareaStyle}
/>

        <button
          onClick={() => finalizeWorkout(note)}
          style={arrowButtonStyle}
        >
          {" > "}
        </button>

        <GlobalProgressSection />
      </div>
    )
  }

  /* ============================= */
  /* EJERCICIO ACTUAL */
  /* ============================= */

  const currentExercise =
    routine.exercises[activeWorkout.currentExerciseIndex]

  if (!currentExercise) return null

  const exerciseObjective =
    objectives.exercises.find(
      e => e.exerciseId === currentExercise.id
    )

  const currentObjectiveWeight =
    exerciseObjective?.objectiveWeights[
      activeWorkout.currentSet - 1
    ] ?? null

  /* ============================= */
  /* HISTORIAL: RECORD Y ÚLTIMO */
  /* ============================= */

  const exerciseHistory = history
    .flatMap(h => h.exercises)
    .filter(ex => ex.exerciseId === currentExercise.id)

  let pesoRecord = 0

  exerciseHistory.forEach(ex => {
    ex.completedSets.forEach(set => {
      if (set.weight > pesoRecord) {
        pesoRecord = set.weight
      }
    })
  })

  let ultimoCargado = 0

  const lastSession = [...history]
    .reverse()
    .find(h =>
      h.exercises.some(
        ex => ex.exerciseId === currentExercise.id
      )
    )

  if (lastSession) {
    const ex = lastSession.exercises.find(
      e => e.exerciseId === currentExercise.id
    )

    const set =
      ex?.completedSets.find(
        s => s.setNumber === activeWorkout.currentSet
      )

    if (set) {
      ultimoCargado = set.weight
    }
  }
  

  return (
    <div style={containerStyle}>

      <div style={{ fontSize: 14, marginBottom: 30 }}>
        Ejercicio {activeWorkout.currentExerciseIndex + 1}/
        {routine.exercises.length}
      </div>

      <div style={titleStyle}>
        {currentExercise.name}
      </div>

      <div style={{ fontSize: 18 }}>
        Serie {activeWorkout.currentSet}/{currentExercise.sets}
      </div>

      <div style={{ fontSize: 18, marginBottom: 10 }}>
        Reps {String(currentExercise.reps).padStart(2, "0")}
      </div>

      <div style={{ marginBottom: 6 }}>
        Peso Record: {pesoRecord}
      </div>

      <div style={{ marginBottom: 6 }}>
        Último Cargado: {ultimoCargado}
      </div>

      {currentObjectiveWeight !== null && (
        <div style={{ marginBottom: 20 }}>
          Objetivo: {currentObjectiveWeight}
        </div>
      )}

      <div style={inputRowStyle}>
        <input
          type="number"
          name="peso_utilizado"
          id="peso_utilizado"
          placeholder="Peso Utilizado"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={() => {
            const numericWeight = Number(weight)
            if (numericWeight <= 0) return
            confirmSet(numericWeight)
            setWeight("")
          }}
          style={arrowButtonStyle}
        >
          {">"}
        </button>
      </div>

      <GlobalProgressSection />
    </div>
  )
}

/* ============================= */
/* INFO BLOCK */
/* ============================= */

function InfoBlock({
  initial,
  progress,
  today,
  objective
}: {
  initial: number
  progress: number
  today: number
  objective: number
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <div>Inicio {initial}</div>
      <div>Progreso {progress}</div>
      <div>Hoy {today}</div>
      <div>Objetivo {objective}</div>
    </div>
  )
}

/* ================= STYLES ================= */

const containerStyle: React.CSSProperties = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "60px 100px",
  fontFamily: "'Courier New', monospace",
  color: "#000",
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  textAlign: "left"
}

const containerCenterStyle: React.CSSProperties = {
  ...containerStyle
}

const initialBlockStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  gap: 12
}

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 400,
  marginBottom: 20
}

const inputRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginTop: 20
}

const inputStyle: React.CSSProperties = {
  width: 140,
  height: 42,
  borderRadius: 8,
  border: "1px solid #000",
  textAlign: "center",
  fontFamily: "'Courier New', monospace"
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: 160,
  padding: 20,
  borderRadius: 12,
  border: "1px solid #000",
  fontFamily: "'Courier New', monospace",
  marginTop: 40,
  marginBottom: 30,
  textAlign: "center"
}

const arrowButtonStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 8,
  border: "1px solid #000",
  background: "white",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}

const startButtonStyle: React.CSSProperties = {
  width: 160,
  height: 45,
  borderRadius: 10,
  border: "1px solid #000",
  background: "white",
  fontSize: 16,
  cursor: "pointer",
  fontFamily: "'Courier New', monospace",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}  