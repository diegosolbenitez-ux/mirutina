import type {
  WeeklyPlan,
  HistoryEntry,
  ActiveWorkout
} from "../models/types"

const WEEKLY_KEY = "weekly_plan"
const HISTORY_KEY = "workout_history"
const ACTIVE_KEY = "active_workout"

// ===== WEEKLY PLAN =====

export const getWeeklyPlan = (): WeeklyPlan => {
  const data = localStorage.getItem(WEEKLY_KEY)
  return data ? JSON.parse(data) : {}
}

export const saveWeeklyPlan = (plan: WeeklyPlan) => {
  localStorage.setItem(
    WEEKLY_KEY,
    JSON.stringify(plan)
  )
}

// ===== HISTORY =====

export const getHistory = (): HistoryEntry[] => {
  const data = localStorage.getItem(HISTORY_KEY)
  return data ? JSON.parse(data) : []
}

export const saveHistory = (
  history: HistoryEntry[]
) => {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  )
}

// ===== ACTIVE WORKOUT =====

export const getActiveWorkout = (): ActiveWorkout | null => {
  const data = localStorage.getItem(ACTIVE_KEY)
  return data ? JSON.parse(data) : null
}

export const saveActiveWorkout = (
  workout: ActiveWorkout
) => {
  localStorage.setItem(
    ACTIVE_KEY,
    JSON.stringify(workout)
  )
}

export const clearActiveWorkout = () => {
  localStorage.removeItem(ACTIVE_KEY)
}
