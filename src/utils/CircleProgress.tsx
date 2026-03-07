import { useEffect, useState } from "react"

type Props = {
  initialVolume: number
  accumulatedProgress: number
  previousProgress: number
  objectiveVolume: number
}

export default function CircleProgress({
  initialVolume,
  accumulatedProgress,
  previousProgress,
  objectiveVolume
}: Props) {

  const BASE_SIZE = 200

  const safeObjective = Math.max(objectiveVolume, 1)
  const safeInitial = Math.min(initialVolume, safeObjective)
  const growthSpace = safeObjective - safeInitial

  const normalize = (value: number) =>
    growthSpace > 0
      ? Math.min(Math.max(value / growthSpace, 0), 1)
      : 0

  const initialRatio = safeInitial / safeObjective

  const previousRatio =
    initialRatio +
    normalize(previousProgress) *
      (1 - initialRatio)

  const currentRatio =
    initialRatio +
    normalize(accumulatedProgress) *
      (1 - initialRatio)

  const [animatedCurrent, setAnimatedCurrent] =
    useState(initialRatio)

  /* ============================= */
  /* DETECTAR OBJETIVO COMPLETADO */
  /* ============================= */

  const hasObjective = objectiveVolume > 0

const goalReached =
  hasObjective &&
  accumulatedProgress + initialVolume >= objectiveVolume

  const [goalAnimation, setGoalAnimation] =
    useState(false)

  useEffect(() => {
    setAnimatedCurrent(currentRatio)
  }, [currentRatio])

  useEffect(() => {
    if (goalReached) {
      setGoalAnimation(true)
    }
  }, [goalReached])

  /* ============================= */
  /* COLORES DINÁMICOS */
  /* ============================= */

  const objectiveBorderColor = goalReached
    ? "#2f2fff"
    : "#3a3a3a"

  const objectiveBackground = goalReached
    ? "rgba(47, 47, 255, 0.16)"
    : "transparent"

  const baselineColor = goalReached
    ? "#ffffff"
    : "#00000000"

  return (
    <div
      style={{
        position: "relative",
        width: BASE_SIZE,
        height: BASE_SIZE,
        margin: "60px auto"
      }}
    >

      {/* OBJETIVO */}
      <div
        style={{
          position: "absolute",
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: "50%",
          border: `1px dashed ${objectiveBorderColor}`,
          background: objectiveBackground,
          transition:
            "background 0.8s ease, border 0.8s ease",
          zIndex: 1
        }}
      />

      {/* CURRENT (relleno progreso) */}
      <div
        style={{
          position: "absolute",
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: "50%",
          boxShadow: "0 0 25px rgba(47,47,255,0.45)",
          background: hasObjective
  ? "#0000ff"
  : "transparent",
          border: "1px dashed #000000",
          top: 0,
          left: 0,
          transform: `scale(${animatedCurrent})`,
          transformOrigin: "center",
          transition:
            "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 2
        }}
      />

      {/* BASELINE */}
      <div
        style={{
          position: "absolute",
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: "50%",
          border: `1px solid ${baselineColor}`,
          background: hasObjective ? "#ffffff" : "transparent",
          top: 0,
          left: 0,
          transform: `scale(${initialRatio})`,
          transformOrigin: "center",
          transition:
            "background 0.8s ease, border 0.8s ease",
          zIndex: 3
        }}
      />

      {/* PREVIOUS */}
      <div
        style={{
          position: "absolute",
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: "50%",
          border: "1px solid #ffffff91",
          background: "solid #ffffffcc",
          top: 0,
          left: 0,
          transform: `scale(${previousRatio})`,
          transformOrigin: "center",
          transition:
            "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 4
        }}
      />

      {/* ANIMACIÓN DE COMPLETADO */}
      {goalAnimation && (
        <div
          style={{
            position: "absolute",
            width: BASE_SIZE,
            height: BASE_SIZE,
            borderRadius: "50%",
            border: "2px solid #2f2fff",
            top: 0,
            left: 0,
            animation: "pulseGoal 1.2s ease-out",
            zIndex: 5
          }}
        />
      )}

      <style>
        
        
        
      </style>

    </div>
  )
}