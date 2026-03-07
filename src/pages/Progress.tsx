import { useState, useMemo, useRef, useEffect } from "react"
import { useWorkoutStore } from "../store/useWorkoutStore"
import type { ProgressMemory } from "../models/types"
import CircleProgress from "../utils/CircleProgress"

const PAGE_SIZE = 60



export default function Progress() {

const [monthOffset, setMonthOffset] = useState(0)

  const { history, memories, planWeeks } = useWorkoutStore()

  const planStart = new Date()

const planEnd = new Date()

planEnd.setDate(
  planStart.getDate() + planWeeks * 7
)

  const sortedHistory = useMemo(() => {

  return [...history].sort((a, b) =>
    a.date.localeCompare(b.date)
  )

}, [history])

  const [selectedMemoryId, setSelectedMemoryId] =
    useState<string | null>(null)

 
  /* =========================
     HISTORIAL ORDENADO
  ========================== */

  const currentMonth = useMemo(() => {

    const planStart = new Date()

const planEnd = new Date()

planEnd.setDate(
  planStart.getDate() + planWeeks * 7
)

  const today = new Date()

  return new Date(
    today.getFullYear(),
    today.getMonth() - monthOffset,
    1
  )

}, [monthOffset])

const touchStartX = useRef<number | null>(null)

function handleTouchStart(e: React.TouchEvent) {

  touchStartX.current = e.touches[0].clientX

}

function handleTouchEnd(e: React.TouchEvent) {

  if (touchStartX.current === null) return

  const delta =
    e.changedTouches[0].clientX - touchStartX.current

  if (delta < -60) {

    // swipe izquierda → mes futuro
    setMonthOffset(prev => prev - 1)

  }

  if (delta > 60) {

    // swipe derecha → mes pasado
    setMonthOffset(prev => prev + 1)

  }

  touchStartX.current = null

}

const completedDays = useMemo(() => {

  const set = new Set<string>()

  history.forEach(h => {

    if (h.metrics.completionPercentage > 0) {

      const d = new Date(h.date)

      const normalized =
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`

      set.add(normalized)

    }

  })

  return set

}, [history])

  const totalPages =
    Math.ceil(sortedHistory.length / PAGE_SIZE)

  const [page, setPage] = useState(0)

  const safePage =
    totalPages === 0
      ? 0
      : Math.min(page, totalPages - 1)

  


  const completedCount =
    sortedHistory.filter(
      h => h.metrics.completionPercentage > 0
    ).length

  /* =========================
     MEMORIAS ORDENADAS
  ========================== */

  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) =>
      b.date.localeCompare(a.date)
    )
  }, [memories])

  const selectedMemory =
    sortedMemories.find(
      m => m.id === selectedMemoryId
    )

  /* =========================
     STATS DESDE MEMORY
  ========================== */

 const exerciseStats = useMemo(() => {

  if (!selectedMemory) return []

  const exercises =
    Array.isArray(selectedMemory.exercises)
      ? selectedMemory.exercises
      : []

  return [...exercises].sort(
    (a,b) =>
      b.volumeContribution -
      a.volumeContribution
  )

},[selectedMemory])


  return (
    
    <div style={containerStyle}>

      {/* ================= GRID DIAS ================= */}

      <div style={topBlockWrapper}>

        {safePage > 0 && (
          <button
            onClick={() => setPage(safePage - 1)}
            style={leftArrowStyle}
          >
            {"<"}
          </button>
        )}

      <div
  style={calendarWrapperStyle}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>

{(() => {

  const monthDate = currentMonth

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const totalDays = lastDay.getDate()
  const startWeekDay = firstDay.getDay()

  const days = []

  for (let i = 0; i < startWeekDay; i++) {
    days.push(null)
  }

  for (let d = 1; d <= totalDays; d++) {

  const dateStr =
    `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`

  days.push({
    date: dateStr,
    day: d
  })

}

  return (

    <div style={monthBlockStyle}>

      <div style={monthLabelStyle}>
        {monthDate.toLocaleString("default",{month:"long"})} {year}
      </div>

      <div style={calendarGridStyle}>

        
        
        {days.map((item, i) => {

  if (!item) return <div key={i} />

  const date = item.date
  const dayNumber = item.day

  const completed = history.some(h =>
  h.date === date && h.metrics.completionPercentage > 0
)

   const cellDate = new Date(date + "T12:00:00")

const inPlan =
  planWeeks > 0 &&
  cellDate >= planStart &&
  cellDate <= planEnd

          return (

            <div
  key={date}
  style={{
    ...calendarDayStyle,

    background: completed
      ? "#2f2fff"
      : "#ffffff",

    border: completed
  ? "1px solid #0000ff"
  : inPlan
  ? "1px solid #2f2fff"
  : "1px solid #b8b8b8",

    boxShadow: completed
      ? "0 0 5px rgba(47,47,255,0.5)"
      : "none",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: 8,
    fontWeight: 600,

    color: completed
      ? "#ffffff"
      : "#8b8b8b"
  }}
>
  {dayNumber}
</div>

          )

        })}

      </div>

    </div>

  )

})()}

</div>

        {safePage < totalPages - 1 && (
          <button
            onClick={() => setPage(safePage + 1)}
            style={rightArrowStyle}
          >
            {">"}
          </button>
        )}

      </div>

      {/* ================= CONTADOR ================= */}

      <div style={counterWrapperStyle}>
        <div>Días</div>
        <div style={{ fontWeight: 700 }}>
          {completedCount}
        </div>
      </div>

      {/* ================= MEMORIAS ================= */}

      {sortedMemories.length > 0 && (
        <div style={memoryGridStyle}>
          {sortedMemories.map(memory => (
            <div
              key={memory.id}
              style={{
                ...memoryBoxStyle,
                border:
                  selectedMemoryId === memory.id
                    ? "1px solid #61616100"
                    : "1px solid #61616100"
              }}
              onClick={() => {
                setSelectedMemoryId(memory.id)
                
              }}
            >
              <MiniCircle memory={memory} />
            </div>
          ))}
        </div>
      )}

      {/* ================= DETALLE MEMORIA ================= */}

      {selectedMemory && (

        <div style={detailWrapperStyle}>

          <CircleProgress
            initialVolume={selectedMemory.initialVolume}
            accumulatedProgress={selectedMemory.finalProgress}
            previousProgress={0}
            objectiveVolume={selectedMemory.objectiveVolume}
          />

          <div style={{ marginTop: 20 }}>
            <div>Fecha {selectedMemory.date}</div>
            <div>Días {selectedMemory.days}</div>
            <div>Inicio {selectedMemory.initialVolume}</div>
            <div>Progreso {selectedMemory.finalProgress}</div>
            <div>Objetivo {selectedMemory.objectiveVolume}</div>
          </div>

          {/* ================= BOTON STATS ================= */}

         

          {/* ================= PANEL STATS ================= */}

          

            <div style={statsBoxStyle}>

              {exerciseStats.length === 0 && (
                <div>No hay ejercicios</div>
              )}

              {exerciseStats.map(ex => (

                <div
                  key={ex.name}
                  style={{ marginBottom: 18 }}
                >

                  <div style={statsRowStyle}>
                    <span>{ex.name}</span>
                    <span>
                      {ex.initialMax} → {ex.finalMax}
                    </span>
                  </div>

                  <StrengthBar
                    initial={ex.initialMax}
                    final={ex.finalMax}
                  />

                  <div style={volumeStyle}>
                    Volumen aportado: {ex.volumeContribution}
                  </div>

                </div>

              ))}

            </div>

          

        </div>

      )}

    </div>
  )
}

/* ================= STRENGTH BAR ================= */

function StrengthBar({
  initial,
  final
}: {
  initial: number
  final: number
}) {

  const safeFinal = Math.max(final, 1)

  const basePercent =
    (initial / safeFinal) * 100

  const growthPercent =
    ((final - initial) / safeFinal) * 100

  return (
    <div
      style={{
        width: "100%",
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        marginTop: 6
      }}
    >

      <div
        style={{
          width: `${basePercent}%`,
          background: "#cfcfcf"
        }}
      />

      <div
        style={{
          width: `${growthPercent}%`,
          background: "#001aff",
          boxShadow: "0 0 25px rgba(47,47,255,0.45)",
          transition: "width 0.6s ease"
        }}
      />

    </div>
  )
}

/* ================= MINI CIRCLE ================= */

function MiniCircle({ memory }: { memory: ProgressMemory }) {

  const SIZE = 70
  const MAX_RADIUS = SIZE / 2

  const safeObjective = Math.max(memory.objectiveVolume, 1)
  const safeInitial = Math.min(memory.initialVolume, safeObjective)

  const growthSpace = safeObjective - safeInitial

  const normalize = (value: number) =>
    growthSpace > 0
      ? Math.min(Math.max(value / growthSpace, 0), 1)
      : 0

  const initialRadius =
    MAX_RADIUS * (safeInitial / safeObjective)

  const currentRadius =
    initialRadius +
    normalize(memory.finalProgress) *
      (MAX_RADIUS - initialRadius)

  return (
    <div
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE
      }}
    >

      {/* objetivo */}
      <div
        style={{
          position: "absolute",
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          border: "1px dashed #000"
        }}
      />

      {/* progreso */}
      <div
        style={{
          position: "absolute",
          width: currentRadius * 2,
          height: currentRadius * 2,
          borderRadius: "50%",
          background: "#e4000000",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />

      {/* baseline */}
      <div
        style={{
          position: "absolute",
          width: initialRadius * 2,
          height: initialRadius * 2,
          borderRadius: "50%",
          border: "0.5px solid #00000075",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />

    </div>
  )
}

/* ================= STYLES ================= */

const containerStyle: React.CSSProperties = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "60px 20px",
  fontFamily: "'Courier New', monospace",
  color: "#000"
}

const topBlockWrapper: React.CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 40
}





const leftArrowStyle: React.CSSProperties = {
  position: "absolute",
  left: -50,
  background: "none",
  border: "none",
  fontSize: 28,
  cursor: "pointer"
}

const rightArrowStyle: React.CSSProperties = {
  position: "absolute",
  right: -50,
  background: "none",
  border: "none",
  fontSize: 28,
  cursor: "pointer"
}

const counterWrapperStyle: React.CSSProperties = {
  marginTop: 20,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6
}

const memoryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 0,
  marginTop: 70,
  justifyItems: "center"
}

const memoryBoxStyle: React.CSSProperties = {
  padding: 25,
  borderRadius: 8,
  cursor: "pointer"
}

const detailWrapperStyle: React.CSSProperties = {
  marginTop: 80,
  textAlign: "center"
}

const statsBoxStyle: React.CSSProperties = {
  border: "1px solid #00000000",
  borderRadius: 10,
  padding: 20,
  marginTop: 20,
  textAlign: "left"
}

const statsRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 14
}

const volumeStyle: React.CSSProperties = {
  fontSize: 12,
  marginTop: 4,
  color: "#444"
}

const calendarWrapperStyle: React.CSSProperties = {

  maxHeight: 320,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 20,
  alignItems: "center"

}

const monthBlockStyle: React.CSSProperties = {

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8

}

const monthLabelStyle: React.CSSProperties = {

  fontSize: 12,
  opacity: 0.6

}

const calendarGridStyle: React.CSSProperties = {

  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  columnGap: 10,   // ← espacio horizontal entre días
  rowGap: 10,
  marginTop: 30,      // ← espacio vertical entre semanas
  width: 260

}

const calendarDayStyle: React.CSSProperties = {

  width: 28,
  height: 28,
  borderRadius: 6,
  border: "1px solid #d1d1d1",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  transition: "all .25s ease"

}