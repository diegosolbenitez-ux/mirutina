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

  useEffect(() => {
    setAnimatedCurrent(currentRatio)
  }, [currentRatio])

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
          border: "1px dashed #3a3a3a",
          zIndex: 1
        }}
      />

      {/* CURRENT (relleno) */}
      <div
        style={{
          position: "absolute",
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: "50%",
          background: "#96969600",
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

      {/* BASELINE (solo borde visible) */}
      <div
        style={{
          position: "absolute",
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: "50%",
          border: "1px solid #000000",
          top: 0,
          left: 0,
          transform: `scale(${initialRatio})`,
          transformOrigin: "center",
          zIndex: 3
        }}
      />

      {/* PREVIOUS (borde dashed visible encima) */}
      <div
        style={{
          position: "absolute",
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: "50%",
          border: "0.5px solid #464646a9",
          top: 0,
          left: 0,
          transform: `scale(${previousRatio})`,
          transformOrigin: "center",
          zIndex: 4
        }}
      />

    </div>
  )
}