import { useState, useMemo, useRef, useEffect } from "react"
import { useWorkoutStore } from "../store/useWorkoutStore"

const PAGE_SIZE = 7

export default function History() {

  const history = useWorkoutStore(s => s.history)

  const sortedHistory = [...(history ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  const totalPages =
    Math.ceil(sortedHistory.length / PAGE_SIZE)

  const [page, setPage] = useState(0)

  const [selectedGlobalIndex, setSelectedGlobalIndex] =
    useState<number | null>(
      sortedHistory.length > 0 ? 0 : null
    )

  const [animateKey, setAnimateKey] = useState(0)
  const [fade, setFade] = useState(true)

  const [panelVisible, setPanelVisible] = useState(
    selectedGlobalIndex !== null
  )

  const historyPanelRef =
    useRef<HTMLDivElement | null>(null)

  const safePage =
    totalPages === 0
      ? 0
      : Math.min(page, totalPages - 1)

  const start = safePage * PAGE_SIZE

  const visible = sortedHistory.slice(
    start,
    start + PAGE_SIZE
  )

  const selectedEntry =
    selectedGlobalIndex !== null
      ? sortedHistory[selectedGlobalIndex]
      : null

  /* ======================== */
  /* CLICK FUERA DEL PANEL */
  /* ======================== */

  useEffect(() => {

    function handleClickOutside(e: MouseEvent) {

      const target = e.target as Node

      if (
        historyPanelRef.current &&
        !historyPanelRef.current.contains(target)
      ) {
        setSelectedGlobalIndex(null)
      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }

  }, [])

  /* ======================== */
  /* ANIMACION PAGINA */
  /* ======================== */

  useEffect(() => {

    setFade(false)

    const t = setTimeout(() => {
      setFade(true)
      setAnimateKey(prev => prev + 1)
    }, 40)

    return () => clearTimeout(t)

  }, [page, selectedGlobalIndex])

  /* ======================== */
  /* CONTROL VISIBILIDAD PANEL */
  /* ======================== */

  useEffect(() => {

    if (selectedGlobalIndex !== null) {

      setPanelVisible(true)

    } else {

      const t = setTimeout(() => {
        setPanelVisible(false)
      }, 200)

      return () => clearTimeout(t)

    }

  }, [selectedGlobalIndex])

  /* ======================== */
  /* PAGINATION */
  /* ======================== */

  const goNextPage = () => {

    if (safePage >= totalPages - 1) return

    setPage(safePage + 1)

    if (selectedGlobalIndex !== null) {

      const nextIndex =
        selectedGlobalIndex + PAGE_SIZE

      if (nextIndex < sortedHistory.length) {
        setSelectedGlobalIndex(nextIndex)
      }

    }

  }

  const goPrevPage = () => {

    if (safePage <= 0) return

    setPage(safePage - 1)

    if (selectedGlobalIndex !== null) {

      const prevIndex =
        selectedGlobalIndex - PAGE_SIZE

      if (prevIndex >= 0) {
        setSelectedGlobalIndex(prevIndex)
      }

    }

  }

  /* ======================== */

  return (
    <div style={containerStyle}>

      <div style={layoutStyle}>

        {/* ===== LEFT (DETAILS) ===== */}

        <div
          ref={historyPanelRef}
          key={animateKey}
          style={{
            ...leftDetailColumnStyle,

            opacity:
              selectedGlobalIndex !== null ? 1 : 0,

            transform:
              selectedGlobalIndex !== null
                ? "translateY(0px)"
                : "translateY(10px)",

            transition: "all 220ms ease"
          }}
        >

          {panelVisible && selectedEntry && (

            <>

              <div style={dataBlockStyle}>

                <div style={{ fontWeight: 700 }}>
                  {(
                    selectedEntry.metrics?.completionPercentage ?? 0
                  ).toFixed(0)}% Completado
                </div>

                <div style={{ marginBottom: 20 }}>
                  Volumen Total:{" "}
                  {selectedEntry.metrics?.totalVolume ?? 0} lbs
                </div>

                {selectedEntry.exercises.map(ex => (

                  <div
                    key={ex.exerciseId}
                    style={{ marginBottom: 16 }}
                  >

                    <div>
                      {ex.name} {ex.sets} x {ex.reps}
                    </div>

                    <div style={{ fontSize: 14 }}>
                      {ex.completedSets
                        .map(s => s.weight)
                        .join(" / ")}
                    </div>

                  </div>

                ))}

              </div>

              <div style={noteBlockStyle}>

                {selectedEntry.note
                  ? selectedEntry.note
                  : "Sin nota"}

                <div
                  style={{
                    marginTop: 10,
                    opacity: 0.6
                  }}
                >
                  {selectedEntry.date}
                </div>

              </div>

            </>

          )}

        </div>

        {/* ===== RIGHT (LIST) ===== */}

        <div
          style={{
            ...rightListColumnStyle,
            opacity: fade ? 1 : 0,
            transform: fade
              ? "translateY(0px)"
              : "translateY(6px)",
            transition: "all 200ms ease"
          }}
        >

          {safePage > 0 && (
            <button
              onClick={goPrevPage}
              style={arrowTopStyle}
            >
              ^
            </button>
          )}

          {visible.map((entry, i) => {

            const globalIndex = start + i

            const isSelected =
              selectedGlobalIndex === globalIndex

            return (

              <button
                key={entry.date + i}

                onClick={() => {

                  if (selectedGlobalIndex === globalIndex) {

                    setSelectedGlobalIndex(null)

                  } else {

                    setSelectedGlobalIndex(globalIndex)

                  }

                }}

                style={{
                  ...dayButtonStyle,

                  background: isSelected
                    ? "#000"
                    : "transparent",

                  color: isSelected
                    ? "#fff"
                    : "#000",

                  transition: "all 180ms ease"
                }}
              >
                {String(globalIndex + 1).padStart(2, "0")}
              </button>

            )

          })}

          {safePage < totalPages - 1 && (
            <button
              onClick={goNextPage}
              style={arrowBottomStyle}
            >
              v
            </button>
          )}

        </div>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const containerStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "60px 30px",
  fontFamily: "'Courier New', monospace",
  color: "#000"
}

const layoutStyle: React.CSSProperties = {
  display: "flex",
  gap: 40,
  alignItems: "flex-start"
}

const leftDetailColumnStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 20
}

const rightListColumnStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 31,
  minWidth: 10,
  position: "relative"
}

const dayButtonStyle: React.CSSProperties = {
  width: 70,
  height: 40,
  borderRadius: 8,
  border: "1px solid #000",
  fontFamily: "'Courier New', monospace",
  cursor: "pointer"
}

const arrowTopStyle: React.CSSProperties = {
  position: "absolute",
  top: -60,
  background: "none",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  fontWeight: 700,
  color: "#000"
}

const arrowBottomStyle: React.CSSProperties = {
  position: "absolute",
  bottom: -60,
  background: "none",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  fontWeight: 700,
  color: "#000"
}

const dataBlockStyle: React.CSSProperties = {
  border: "1px solid #000",
  borderRadius: 12,
  padding: 25,
  lineHeight: 1.6
}

const noteBlockStyle: React.CSSProperties = {
  border: "1px solid #000",
  borderRadius: 12,
  padding: 20,
  lineHeight: 1.6,
  maxWidth: "100%",
  width: "100%",
  boxSizing: "border-box",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap"
}