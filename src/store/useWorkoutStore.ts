import { create } from "zustand"

import type {
  WeekDay,
  RoutineTemplate,
  WeeklyPlan,
  ActiveWorkout,
  CompletedSet,
  HistoryEntry,
  ProgressMemory
} from "../models/types"

import {
  saveWeeklyPlan,
  getWeeklyPlan,
  saveHistory,
  getHistory,
  saveActiveWorkout,
  getActiveWorkout,
  clearActiveWorkout
} from "../utils/storage"

import {
  buildExerciseSnapshots,
  getTodayDate
} from "../utils/calculations"

/* ============================= */
/* UTIL */
/* ============================= */

const generateId = () =>
  Date.now().toString() +
  Math.random().toString(36).slice(2)

/* ============================= */
/* STATE INTERNO */
/* ============================= */

type ExerciseObjectiveState = {
  exerciseId: string
  baselineWeights: number[]
  bestWeights: number[]
  objectiveWeights: number[]
}

type ObjectivesState = {
  exercises: ExerciseObjectiveState[]
  accumulatedProgress: number
  todayProgress: number
}

type WorkoutStore = {
  weeklyPlan: WeeklyPlan
  activeWorkout: ActiveWorkout | null
  history: HistoryEntry[]
  objectives: ObjectivesState
  memories: ProgressMemory[]

  setRoutineForDay: (
    day: WeekDay,
    routine: RoutineTemplate
  ) => void

  setObjectiveWeights: (
    exerciseId: string,
    weights: number[]
  ) => void

  startWorkout: (day: WeekDay) => void
  confirmSet: (weight: number) => void
  finalizeWorkout: (note: string) => void
  resetActiveWorkout: () => void
  loadPersistedWorkout: () => void
}

const defaultObjectives: ObjectivesState = {
  exercises: [],
  accumulatedProgress: 0,
  todayProgress: 0
}

/* ============================= */
/* STORE */
/* ============================= */

export const useWorkoutStore =
  create<WorkoutStore>((set, get) => ({

    weeklyPlan: getWeeklyPlan(),
    activeWorkout: getActiveWorkout(),
    history: getHistory(),

    objectives:
      JSON.parse(
        localStorage.getItem("workout_objectives") || "null"
      ) ?? defaultObjectives,

    memories:
      JSON.parse(
        localStorage.getItem("progress_memories") || "[]"
      ),

    /* ============================= */
    /* SET ROUTINE */
    /* ============================= */

    setRoutineForDay: (day, routine) => {

      const updatedPlan: WeeklyPlan = {
        ...get().weeklyPlan,
        [day]: routine
      }

      saveWeeklyPlan(updatedPlan)

      const activeExerciseIds =
        Object.values(updatedPlan)
          .flatMap(r => r?.exercises ?? [])
          .map(e => e.id)

      let filteredObjectives: ObjectivesState

if (activeExerciseIds.length === 0) {
  filteredObjectives = {
    exercises: [],
    accumulatedProgress: 0,
    todayProgress: 0
  }
} else {
  filteredObjectives = {
    ...get().objectives,
    exercises: get().objectives.exercises.filter(e =>
      activeExerciseIds.includes(e.exerciseId)
    )
  }
}

      localStorage.setItem(
        "workout_objectives",
        JSON.stringify(filteredObjectives)
      )

      set({
        weeklyPlan: updatedPlan,
        objectives: filteredObjectives
      })
    },

    /* ============================= */
    /* SET OBJECTIVE WEIGHTS */
    /* ============================= */

    setObjectiveWeights: (exerciseId, weights) => {

      const { objectives } = get()

      const updatedExercises =
        objectives.exercises.map(o => ({ ...o }))

      const index =
        updatedExercises.findIndex(
          e => e.exerciseId === exerciseId
        )

      if (index === -1) {
        updatedExercises.push({
          exerciseId,
          baselineWeights: [],
          bestWeights: [],
          objectiveWeights: weights
        })
      } else {
        updatedExercises[index] = {
          ...updatedExercises[index],
          objectiveWeights: weights
        }
      }

      const updatedObjectives = {
        ...objectives,
        exercises: updatedExercises
      }

      localStorage.setItem(
        "workout_objectives",
        JSON.stringify(updatedObjectives)
      )

      set({ objectives: updatedObjectives })
    },

    /* ============================= */
    /* START WORKOUT */
    /* ============================= */

    startWorkout: (day) => {

      const routine = get().weeklyPlan[day]
      if (!routine) return

      const workout: ActiveWorkout = {
        date: getTodayDate(),
        day,
        routineId: routine.id,
        currentExerciseIndex: 0,
        currentSet: 1,
        completedSets: []
      }

      saveActiveWorkout(workout)

      set({
        activeWorkout: workout,
        objectives: {
          ...get().objectives,
          todayProgress: 0
        }
      })
    },

    /* ============================= */
    /* CONFIRM SET (SIN MEMORIA) */
    /* ============================= */

    confirmSet: (weight) => {

      const {
        activeWorkout,
        weeklyPlan,
        objectives
      } = get()

      if (!activeWorkout) return

      const routine =
        weeklyPlan[activeWorkout.day]

      if (!routine) return

      const exercise =
        routine.exercises[
          activeWorkout.currentExerciseIndex
        ]

      if (!exercise) return

      const newSet: CompletedSet = {
        exerciseId: exercise.id,
        setNumber: activeWorkout.currentSet,
        weight
      }

      const updatedCompletedSets = [
        ...activeWorkout.completedSets,
        newSet
      ]

      const updatedExercises =
        objectives.exercises.map(o => ({ ...o }))

      let objective =
        updatedExercises.find(
          o => o.exerciseId === exercise.id
        )

      if (!objective) {
        objective = {
          exerciseId: exercise.id,
          baselineWeights: [],
          bestWeights: [],
          objectiveWeights: []
        }
        updatedExercises.push(objective)
      }

      let delta = 0
      const setIndex =
        activeWorkout.currentSet - 1

      const exerciseSets =
        updatedCompletedSets.filter(
          s => s.exerciseId === exercise.id
        )

      if (objective.baselineWeights.length === 0) {

        if (exerciseSets.length === exercise.sets) {

          const weights =
            exerciseSets.map(s => s.weight)

          objective.baselineWeights = [...weights]
          objective.bestWeights = [...weights]
        }

      } else {

        const previousBest =
          objective.bestWeights[setIndex] ?? 0

        if (weight > previousBest) {
          delta = weight - previousBest
          objective.bestWeights[setIndex] = weight
        }
      }

      const accumulated =
        updatedExercises.reduce((total, ex) => {

          const baselineSum =
            ex.baselineWeights.reduce((a, b) => a + b, 0)

          const bestSum =
            ex.bestWeights.reduce((a, b) => a + b, 0)

          return total + (bestSum - baselineSum)

        }, 0)

      const updatedObjectives: ObjectivesState = {
        exercises: updatedExercises,
        accumulatedProgress: accumulated,
        todayProgress: objectives.todayProgress + delta
      }

      let nextExerciseIndex =
        activeWorkout.currentExerciseIndex

      let nextSet =
        activeWorkout.currentSet + 1

      if (nextSet > exercise.sets) {
        nextSet = 1
        nextExerciseIndex++
      }

      const updatedWorkout: ActiveWorkout = {
        ...activeWorkout,
        currentExerciseIndex: nextExerciseIndex,
        currentSet: nextSet,
        completedSets: updatedCompletedSets
      }

      saveActiveWorkout(updatedWorkout)

      localStorage.setItem(
        "workout_objectives",
        JSON.stringify(updatedObjectives)
      )

      set({
        activeWorkout: updatedWorkout,
        objectives: updatedObjectives
      })
    },

    /* ============================= */
    /* FINALIZE WORKOUT + MEMORIA */
    /* ============================= */

    finalizeWorkout: (note) => {

      const {
        activeWorkout,
        weeklyPlan,
        history,
        objectives,
        memories
      } = get()

      if (!activeWorkout) return

      const routine =
        weeklyPlan[activeWorkout.day]

      if (!routine) return

      const exercises =
        buildExerciseSnapshots(
          routine,
          activeWorkout.completedSets
        )

      const totalSeriesPlanned =
        routine.exercises.reduce(
          (acc, ex) => acc + ex.sets,
          0
        )

      const totalSeriesCompleted =
        activeWorkout.completedSets.length

      const completionPercentage =
        totalSeriesPlanned === 0
          ? 0
          : Math.round(
              (totalSeriesCompleted /
                totalSeriesPlanned) * 100
            )

      const totalVolume =
        exercises.reduce(
          (acc, ex) => acc + ex.totalVolume,
          0
        )

      const metrics = {
        totalSeriesPlanned,
        totalSeriesCompleted,
        completionPercentage,
        totalVolume
      }

      /* ===== CREAR MEMORIA SI META ALCANZADA ===== */

      const objectiveVolume =
        objectives.exercises.reduce(
          (total, ex) =>
            total +
            ex.objectiveWeights.reduce(
              (a, b) => a + (b || 0),
              0
            ),
          0
        )

      const initialVolume =
        objectives.exercises.reduce(
          (total, ex) =>
            total +
            ex.baselineWeights.reduce(
              (a, b) => a + (b || 0),
              0
            ),
          0
        )

      const accumulated =
        objectives.accumulatedProgress

      const alreadySaved =
        memories.some(
          m =>
            m.objectiveVolume === objectiveVolume &&
            m.finalProgress >= objectiveVolume
        )

      const realTotal = initialVolume + accumulated

if (
  objectiveVolume > 0 &&
  realTotal >= objectiveVolume &&
  !alreadySaved
) {
        const newMemory: ProgressMemory = {
          id: generateId(),
          date: getTodayDate(),
          initialVolume,
          objectiveVolume,
          finalProgress: accumulated,
          days: history.length + 1
        }

        const updatedMemories = [
          ...memories,
          newMemory
        ]

        localStorage.setItem(
          "progress_memories",
          JSON.stringify(updatedMemories)
        )

        set({ memories: updatedMemories })
      }

      /* ===== GUARDAR HISTORIAL ===== */

      const updatedHistory: HistoryEntry[] = [
        ...history,
        {
          date: activeWorkout.date,
          day: activeWorkout.day,
          routineId: routine.id,
          exercises,
          metrics,
          note
        }
      ]

      saveHistory(updatedHistory)
      clearActiveWorkout()

      set({
        history: updatedHistory,
        activeWorkout: null
      })
    },

    resetActiveWorkout: () => {
      clearActiveWorkout()
      set({ activeWorkout: null })
    },

    loadPersistedWorkout: () => {
      const persisted = getActiveWorkout()
      if (persisted) {
        set({ activeWorkout: persisted })
      }
    }

  }))