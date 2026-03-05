const STORAGE_KEY = "exercise_library"

export function getExerciseLibrary(): string[] {

  const data = localStorage.getItem(STORAGE_KEY)

  if (!data) return []

  try {
    return JSON.parse(data)
  } catch {
    return []
  }

}

export function saveExerciseLibrary(list: string[]) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(list)
  )

}

export function addExerciseToLibrary(name: string) {

  const list = getExerciseLibrary()

  const exists = list.find(
    e => e.toLowerCase() === name.toLowerCase()
  )

  if (!exists) {

    list.push(name)

    saveExerciseLibrary(list)

  }

}

export function removeExerciseFromLibrary(name: string) {

  const list = getExerciseLibrary()

  const filtered =
    list.filter(e => e !== name)

  saveExerciseLibrary(filtered)

}

export function searchExercises(query: string): string[] {

  const list = getExerciseLibrary()

  const q = query.toLowerCase()

  return list.filter(ex =>
    ex.toLowerCase().includes(q)
  )

}