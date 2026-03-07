import { useMemo } from "react"
import { useWorkoutStore } from "../store/useWorkoutStore"

/* ================= TYPES ================= */

type HistoricalExercise = {

  name: string

  initialMax: number
  finalMax: number

  volumeTotal: number

  cycles: number

  progression: number[]

}

/* ================= PAGE ================= */

export default function ExerciseHistory() {

  const { memories } = useWorkoutStore()

  const historicalExercises = useMemo(() => {

    const map = new Map<string, HistoricalExercise>()

    memories.forEach(memory => {

      if (!Array.isArray(memory.exercises)) return

      memory.exercises.forEach(ex => {

        if (!map.has(ex.name)) {

          map.set(ex.name, {

            name: ex.name,

            initialMax: ex.initialMax,
            finalMax: ex.finalMax,

            volumeTotal: ex.volumeContribution,

            cycles: 1,

            progression: [ex.finalMax]

          })

        } else {

          const entry = map.get(ex.name)!

          entry.initialMax =
            Math.min(entry.initialMax, ex.initialMax)

          entry.finalMax =
            Math.max(entry.finalMax, ex.finalMax)

          entry.volumeTotal += ex.volumeContribution

          entry.cycles += 1

          entry.progression.push(ex.finalMax)

        }

      })

    })

    return Array
      .from(map.values())
      .sort((a, b) => b.volumeTotal - a.volumeTotal)

  }, [memories])

  return (

    <div style={containerStyle}>

      <div style={titleStyle}>
        
      </div>

      <div style={statsBoxStyle}>

        {historicalExercises.length === 0 && (

          <div style={{ textAlign: "center" }}>
            No hay datos
          </div>

        )}

        {historicalExercises.map(ex => (

          <div
            key={ex.name}
            style={{ marginBottom: 26 }}
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
              Volumen total: {ex.volumeTotal}
            </div>

            <div style={cyclesStyle}>
              Ciclos: {ex.cycles}
            </div>

            <CycleLine
              data={ex.progression}
            />

          </div>

        ))}

      </div>

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

    <div style={barWrapperStyle}>

      <div
        style={{
          width: `${basePercent}%`,
          background: "#cfcfcf"
        }}
      />

      <div
        style={{
          width: `${growthPercent}%`,
          background: "#0000ff"
        }}
      />

    </div>

  )

}

/* ================= LINE GRAPH ================= */

function CycleLine({ data }: { data: number[] }) {

  if (data.length <= 1) return null

  const width = 260
  const height = 70

  const max = Math.max(...data)
  const min = Math.min(...data)

  const normalizeY = (value: number) => {

    if (max === min) return height / 2

    return height - ((value - min) / (max - min)) * height

  }

  const stepX = width / (data.length - 1)

  const points = data.map((v, i) => {

    const x = i * stepX
    const y = normalizeY(v)

    return `${x},${y}`

  }).join(" ")

  return (

    <svg
      width={width}
      height={height}
      style={{ marginTop: 12 }}
    >

      <polyline
        fill="none"
        stroke="#0000ff"
        strokeWidth="3"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((v, i) => {

        const x = i * stepX
        const y = normalizeY(v)

        return (

          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="#0000ff"
            
          />

        )

      })}

    </svg>

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

const titleStyle: React.CSSProperties = {

  textAlign: "center",
  marginBottom: 40,
  fontWeight: 700

}

const statsBoxStyle: React.CSSProperties = {

  border: "1px solid #00000000",

  borderRadius: 10,

  padding: 20,

  textAlign: "left"

}

const statsRowStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "space-between",

  fontSize: 14

}

const barWrapperStyle: React.CSSProperties = {

  width: "100%",

  height: 8,

  borderRadius: 4,

  overflow: "hidden",

  display: "flex",

  marginTop: 6

}

const volumeStyle: React.CSSProperties = {

  fontSize: 12,

  marginTop: 4,

  color: "#444"

}

const cyclesStyle: React.CSSProperties = {

  fontSize: 11,

  color: "#666"

}