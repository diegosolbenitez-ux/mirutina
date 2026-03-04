import { useState, useMemo, useRef } from "react"
import { useWorkoutStore } from "../store/useWorkoutStore"
import type {
  WeekDay,
  ExerciseTemplate,
  RoutineTemplate
} from "../models/types"

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

const weekDays: WeekDay[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
]

const defaultLabels: Record<WeekDay, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miercoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sabado",
  domingo: "Domingo"
}

type TempInput = {
  name: string
  sets: number
  reps: number
}

export default function CreateRoutine() {

  const {
    weeklyPlan,
    setRoutineForDay,
    objectives,
    setObjectiveWeights
  } = useWorkoutStore()

  const planRef = useRef<HTMLDivElement | null>(null)
  const longPressTimer = useRef<number | null>(null)

  const [expandedDay, setExpandedDay] =
    useState<WeekDay | null>(null)

  const [editingDay, setEditingDay] =
    useState<WeekDay | null>(null)

  const [dayLabels, setDayLabels] =
    useState<Record<WeekDay, string>>(defaultLabels)

  const [planExpanded, setPlanExpanded] =
    useState(false)

  const [dayExercises, setDayExercises] =
    useState<Record<WeekDay, ExerciseTemplate[]>>(
      weekDays.reduce((acc, day) => {
        acc[day] =
          weeklyPlan?.[day]?.exercises || []
        return acc
      }, {} as Record<WeekDay, ExerciseTemplate[]>)
    )

  const [tempInputs, setTempInputs] =
    useState<Record<WeekDay, TempInput>>(
      weekDays.reduce((acc, day) => {
        acc[day] = { name: "", sets: 0, reps: 0 }
        return acc
      }, {} as Record<WeekDay, TempInput>)
    )

  const toggleDay = (day: WeekDay) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  /* =============================
     LONG PRESS (DESKTOP + MOBILE)
  ============================= */

  const startLongPress = (day: WeekDay) => {
    longPressTimer.current = window.setTimeout(() => {
      setEditingDay(day)
    }, 500)
  }

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  /* =============================
     ADD EXERCISE
  ============================= */

  const addExercise = (day: WeekDay) => {

    const input = tempInputs[day]
    const name = input.name?.trim()
    const sets = Number(input.sets)
    const reps = Number(input.reps)

    if (!name || !sets || !reps) return

    const newExercise: ExerciseTemplate = {
      id: generateId(),
      name,
      sets,
      reps
    }

    const updatedExercises = [
      ...(dayExercises[day] || []),
      newExercise
    ]

    setDayExercises({
      ...dayExercises,
      [day]: updatedExercises
    })

    const routine: RoutineTemplate = {
      id: generateId(),
      name: dayLabels[day],
      exercises: updatedExercises
    }

    setRoutineForDay(day, routine)

    setTempInputs({
      ...tempInputs,
      [day]: { name: "", sets: 0, reps: 0 }
    })
  }

  const removeExercise = (day: WeekDay, id: string) => {

    const updatedExercises =
      (dayExercises[day] || []).filter(
        ex => ex.id !== id
      )

    setDayExercises({
      ...dayExercises,
      [day]: updatedExercises
    })

    const routine: RoutineTemplate = {
      id: generateId(),
      name: dayLabels[day],
      exercises: updatedExercises
    }

    setRoutineForDay(day, routine)
  }

  const clearAllRoutines = () => {

  const emptyExercises: Record<WeekDay, ExerciseTemplate[]> =
    weekDays.reduce((acc, day) => {
      acc[day] = []
      return acc
    }, {} as Record<WeekDay, ExerciseTemplate[]>)

  setDayExercises(emptyExercises)

  weekDays.forEach(day => {
    const emptyRoutine: RoutineTemplate = {
      id: generateId(),
      name: dayLabels[day],
      exercises: []
    }

    setRoutineForDay(day, emptyRoutine)
  })
}

  /* =============================
     EJERCICIOS ACTIVOS
  ============================= */

  const allExercises = useMemo(() => {
    return Object.values(weeklyPlan || {})
      .filter(Boolean)
      .flatMap(r => r?.exercises ?? [])
  }, [weeklyPlan])

  const activeExerciseIds =
    allExercises.map(e => e.id)

  const activeObjectives =
    objectives.exercises.filter(o =>
      activeExerciseIds.includes(o.exerciseId)
    )

  const volumeBaseline = activeObjectives.reduce(
    (acc, ex) =>
      acc +
      ex.baselineWeights.reduce(
        (a: number, b: number) => a + (b || 0),
        0
      ),
    0
  )

  const volumeObjective = activeObjectives.reduce(
    (acc, ex) =>
      acc +
      ex.objectiveWeights.reduce(
        (a: number, b: number) => a + (b || 0),
        0
      ),
    0
  )

  const handleObjectiveChange = (
    exerciseId: string,
    index: number,
    value: number
  ) => {

    const objective =
      objectives.exercises.find(
        o => o.exerciseId === exerciseId
      )

    const current =
      objective?.objectiveWeights || []

    const updated = [...current]
    updated[index] = value

    setObjectiveWeights(exerciseId, updated)
  }

  return (
    <div style={containerStyle}>


   

      {weekDays.map(day => {

        const isExpanded = expandedDay === day
        const isEditing = editingDay === day
        const exercises = dayExercises[day] ?? []

        return (
          <div key={day} style={dayContainerStyle(isExpanded)}>

            <div
              style={headerStyle(isExpanded)}
              onClick={() => {
                if (!isEditing) toggleDay(day)
              }}
            >

              {isEditing ? (
                <input
                  autoFocus
                  value={dayLabels[day]}
                  onChange={(e) =>
                    setDayLabels({
                      ...dayLabels,
                      [day]: e.target.value
                    })
                  }
                  onBlur={() => {
                    const value = dayLabels[day].trim()
                    if (value.length === 0) {
                      setDayLabels({
                        ...dayLabels,
                        [day]: defaultLabels[day]
                      })
                    }
                    setEditingDay(null)
                  }}
                  style={editableInputStyle}
                />
              ) : (
                <span
                  style={{ cursor: "pointer" }}
                  onMouseDown={() => startLongPress(day)}
                  onMouseUp={clearLongPress}
                  onMouseLeave={clearLongPress}
                  onTouchStart={() => startLongPress(day)}
                  onTouchEnd={clearLongPress}
                >
                  {dayLabels[day]}
                </span>
              )}

              <span style={{ fontWeight: 700 }}>
                {isExpanded ? "‹" : ">"}
              </span>

            </div>

            {isExpanded && (
              <div style={expandedCardStyle}>

                <div style={inputRowStyle}>

                  <input
                    type="text"
                    placeholder="Nombre"
                    value={tempInputs[day].name}
                    onChange={(e) =>
                      setTempInputs({
                        ...tempInputs,
                        [day]: {
                          ...tempInputs[day],
                          name: e.target.value
                        }
                      })
                    }
                    style={nameInputStyle}
                  />

                  <input
                    type="number"
                    placeholder="Reps"
                    value={tempInputs[day].reps || ""}
                    onChange={(e) =>
                      setTempInputs({
                        ...tempInputs,
                        [day]: {
                          ...tempInputs[day],
                          reps:
                            e.target.value === ""
                              ? 0
                              : Number(e.target.value)
                        }
                      })
                    }
                    style={smallInputStyle}
                  />

                  <input
                    type="number"
                    placeholder="Series"
                    value={tempInputs[day].sets || ""}
                    onChange={(e) =>
                      setTempInputs({
                        ...tempInputs,
                        [day]: {
                          ...tempInputs[day],
                          sets:
                            e.target.value === ""
                              ? 0
                              : Number(e.target.value)
                        }
                      })
                    }
                    style={smallInputStyle}
                  />

                  <button
                    onClick={() => addExercise(day)}
                    style={iconButtonStyle}
                  >
                    +
                  </button>

                </div>

                {exercises.map(ex => (
                  <div key={ex.id} style={exerciseRowStyle}>
                    <span>
                      {ex.name} {ex.reps} x {ex.sets}
                    </span>
                    <button
                      onClick={() =>
                        removeExercise(day, ex.id)
                      }
                      style={iconButtonStyle}
                    >
                      -
                    </button>
                  </div>
                ))}

              </div>
            )}

          </div>
        )
      })}
      
<div style={clearButtonWrapperStyle}>
  <button
    onClick={clearAllRoutines}
    style={clearButtonStyle}
  >
    X
  </button>
</div>  
      <div
        ref={planRef}
        style={planContainerStyle(planExpanded)}
      >

        <div
          onClick={() => setPlanExpanded(!planExpanded)}
          style={planHeaderStyle()}
        >
          <span>Plan</span>
          <span style={{ fontWeight: 700 }}>
            {planExpanded ? "‹" : ">"}
          </span>
        </div>

        {planExpanded && (
          <div style={planExpandedCardStyle}>

            {allExercises.map(ex => {

              const objective =
                objectives.exercises.find(
                  o => o.exerciseId === ex.id
                )

              return (
                <div key={ex.id} style={planExerciseRowStyle}>

                  <div>{ex.name}</div>

                  <div style={planRightColumnStyle}>

                    <div>
                      {objective?.baselineWeights?.length
                        ? objective.baselineWeights.join(" / ")
                        : "Sin información"}
                    </div>

                    <div>
                      {Array.from({ length: ex.sets }).map((_, i) => (
                        <input
                          key={i}
                          type="number"
                          value={
                            objective?.objectiveWeights?.[i] ?? ""
                          }
                          onChange={(e) =>
                            handleObjectiveChange(
                              ex.id,
                              i,
                              Number(e.target.value)
                            )
                          }
                          style={planInputStyle}
                        />
                      ))}
                    </div>

                  </div>
                </div>
              )
            })}

            <div>Volumen Baseline: {volumeBaseline}</div>
            <div>Volumen Objetivo: {volumeObjective}</div>

          </div>
        )} 

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const editableInputStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  background: "transparent",
  fontFamily: "monospace",
  fontSize: 14,
  width: "100%"
}

const containerStyle: React.CSSProperties = {
  width: "95%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 30,
  paddingTop: 40,
  fontFamily: "monospace"
}

const dayContainerStyle = (expanded: boolean): React.CSSProperties => ({
  width: expanded ? 420 : 240,
  transition: "all 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
})

const headerStyle = (expanded: boolean): React.CSSProperties => ({
  width: "100%",
  background: expanded ? "#000000" : "transparent",
  color: expanded ? "#fff" : "#000",
  border: "1px solid #8b8b8bbd",
  borderRadius: 10,
  padding: "14px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  fontSize: 14
})

const expandedCardStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 20,
  border: "1px solid #8b8b8bbd",
  borderRadius: 10,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 20
}

const inputRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
}

const nameInputStyle: React.CSSProperties = {
  flex: 2,
  border: "1px solid #a3a3a3",
  height: 26,
  borderRadius: 6,
  padding: "6px 8px"
}

const smallInputStyle: React.CSSProperties = {
  width: 60,
  height: 26,
  border: "1px solid #a3a3a3",
  borderRadius: 6,
  textAlign: "center"
}

const iconButtonStyle: React.CSSProperties = {
  border: "1px solid #ffffff",
  background: "transparent",
  width: 28,
  height: 28,
  cursor: "pointer"
}

const exerciseRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}

const planContainerStyle = (expanded: boolean): React.CSSProperties => ({
  width: expanded ? 420 : 240,
  transition: "all 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
})

const planHeaderStyle = (): React.CSSProperties => ({
  width: "100%",
  padding: "10px 80px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  marginTop: 10,
  fontSize: 14
})

const planExpandedCardStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 10,
  border: "1px solid #000",
  borderRadius: 10,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 30
}

const planExerciseRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between"
}

const planRightColumnStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 6
}

const planInputStyle: React.CSSProperties = {
  width: 30,
  marginLeft: 6,
  textAlign: "center",
  border: "1px solid #8b8b8bbd",
  borderRadius: 6
}

const clearButtonWrapperStyle: React.CSSProperties = {
  width: 420,
  display: "flex",
  justifyContent: "center",
   marginTop: 10,
  marginBottom: 0
}

const clearButtonStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 6,
  border: "1px solid #b8b8b8",
  background: "white",
  cursor: "pointer",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 500
}
