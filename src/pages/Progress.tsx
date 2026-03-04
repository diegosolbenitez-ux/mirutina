import { useState, useMemo } from "react"
import { useWorkoutStore } from "../store/useWorkoutStore"
import type { ProgressMemory } from "../models/types"
import CircleProgress from "../utils/CircleProgress"

const PAGE_SIZE = 60

export default function Progress() {

  const { history, memories } = useWorkoutStore()

  const [selectedMemoryId, setSelectedMemoryId] =
    useState<string | null>(null)

  /* =========================
     HISTORIAL ORDENADO
  ========================== */

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) =>
      a.date.localeCompare(b.date)
    )
  }, [history])

  const totalPages =
    Math.ceil(sortedHistory.length / PAGE_SIZE)

  const [page, setPage] = useState(0)

  const safePage =
    totalPages === 0
      ? 0
      : Math.min(page, totalPages - 1)

  const start = safePage * PAGE_SIZE

  const visible =
    sortedHistory.slice(start, start + PAGE_SIZE)

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

        <div style={gridStyle}>
          {visible.map((entry, i) => {

            const isCompleted =
              entry.metrics.completionPercentage > 0

            return (
              <div
                key={entry.date + i}
                style={{
                  ...squareStyle,
                  background: isCompleted
                    ? "#474747"
                    : "#ffffff"
                }}
              />
            )
          })}
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
                    ? "2px solid black"
                    : "1px solid #000"
              }}
              onClick={() =>
                setSelectedMemoryId(memory.id)
              }
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

        </div>
      )}

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
      {/* OBJETIVO */}
      <div
        style={{
          position: "absolute",
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          border: "1px dashed #000"
        }}
      />

      {/* PROGRESO */}
      <div
        style={{
          position: "absolute",
          width: currentRadius * 2,
          height: currentRadius * 2,
          borderRadius: "50%",
          background: "#31313100",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />

      {/* BASELINE */}
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

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(10, 1fr)",
  gap: 4,
  width: 260
}

const squareStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  border: "1px solid #7575755b",
  borderRadius: 6
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
  gap: 20,
  marginTop: 60,
  justifyItems: "center"
}

const memoryBoxStyle: React.CSSProperties = {
  padding: 15,
  borderRadius: 8,
  cursor: "pointer"
}

const detailWrapperStyle: React.CSSProperties = {
  marginTop: 60,
  textAlign: "center"
}