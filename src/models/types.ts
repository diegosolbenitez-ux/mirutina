/* ================= CORE DOMAIN ================= */

export type WeekDay =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo"

/* ================= EXERCISES ================= */

export type ExerciseTemplate = {
  id: string
  name: string
  sets: number
  reps: number
}

/* Alias opcional (si lo usas en otros lados) */
export type Exercise = ExerciseTemplate

/* ================= ROUTINES ================= */

export type RoutineTemplate = {
  id: string
  name: string
  exercises: ExerciseTemplate[]
}

export type WeeklyPlan = {
  [key in WeekDay]?: RoutineTemplate
}

/* ================= WORKOUT EXECUTION ================= */

export type CompletedSet = {
  exerciseId: string
  setNumber: number
  weight: number
}

export type ActiveWorkout = {
  date: string
  day: WeekDay
  routineId: string
  currentExerciseIndex: number
  currentSet: number
  completedSets: CompletedSet[]
  note?: string
}

/* ================= HISTORY ================= */

export type ExerciseSnapshot = {
  exerciseId: string
  name: string
  sets: number
  reps: number
  completedSets: CompletedSet[]
  totalVolume: number
}

export type WorkoutMetrics = {
  totalSeriesPlanned: number
  totalSeriesCompleted: number
  completionPercentage: number
  totalVolume: number
}

export type HistoryEntry = {
  date: string
  day: WeekDay
  routineId: string
  exercises: ExerciseSnapshot[]
  metrics: WorkoutMetrics
  note?: string
}

/* ================= PROGRESS MEMORY ================= */
/* Se guarda cuando accumulatedProgress >= objectiveVolume */

export type MemoryExercise = {
  name: string
  initialMax: number
  finalMax: number
  volumeContribution: number
}

export type ProgressMemory = {
  id: string
  startDate: string
  date: string
  days: number
  initialVolume: number
  objectiveVolume: number
  finalProgress: number
  exercises: MemoryExercise[]
}
/* ================= OBJECTIVES ================= */

export type ExerciseObjective = {
  exerciseId: string
  baselineWeights: number[]
  objectiveWeights: number[]
}

export type GlobalObjective = {
  exercises: ExerciseObjective[]
}

