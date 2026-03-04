import type {
  RoutineTemplate,
  CompletedSet,
  WorkoutMetrics,
  ExerciseSnapshot
} from "../models/types"

/* ============================= */
/* FECHA ACTUAL */
/* ============================= */

export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0]
}

/* ============================= */
/* CALCULAR MÉTRICAS */
/* ============================= */

export const calculateMetrics = (
  routine: RoutineTemplate,
  completedSets: CompletedSet[]
): WorkoutMetrics => {

  const totalSeriesPlanned =
    routine.exercises.reduce(
      (acc, ex) => acc + ex.sets,
      0
    )

  const totalSeriesCompleted =
    completedSets.length

  const completionPercentage =
    totalSeriesPlanned === 0
      ? 0
      : Math.round(
          (totalSeriesCompleted / totalSeriesPlanned) * 100
        )

  const totalVolume =
    completedSets.reduce(
      (acc, set) => acc + set.weight,
      0
    )

  return {
    totalSeriesPlanned,
    totalSeriesCompleted,
    completionPercentage,
    totalVolume
  }
}

/* ============================= */
/* SNAPSHOT DE EJERCICIOS */
/* ============================= */

export const buildExerciseSnapshots = (
  routine: RoutineTemplate,
  completedSets: CompletedSet[]
): ExerciseSnapshot[] => {

  return routine.exercises.map(ex => {

    const setsForExercise =
      completedSets.filter(
        s => s.exerciseId === ex.id
      )

    const totalVolume =
      setsForExercise.reduce(
        (acc, set) => acc + set.weight,
        0
      )

    return {
      exerciseId: ex.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      completedSets: setsForExercise,
      totalVolume
    }
  })
}