import { useState, useMemo, useRef, useEffect } from "react"
import { useWorkoutStore } from "../store/useWorkoutStore"
import type {
  WeekDay,
  ExerciseTemplate,
  RoutineTemplate
} from "../models/types"

import {
  getExerciseLibrary,
  addExerciseToLibrary,
  removeExerciseFromLibrary,
  searchExercises
} from "../utils/exerciseLibrary"

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

const weekDays: WeekDay[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
]

const defaultLabels: Record<WeekDay, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miercoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sabado",
  domingo: "Domingo"
}

type TempInput = {
  name: string
  sets: number
  reps: number
}

export default function CreateRoutine() {

const [confirmResetOpen, setConfirmResetOpen] = useState(false)

  const {
    weeklyPlan,
    setRoutineForDay,
    objectives,
    setObjectiveWeights
  } = useWorkoutStore()

const expandedDayRef = useRef<HTMLDivElement | null>(null)

const topBarRef = useRef<HTMLDivElement | null>(null)

const planPanelRef = useRef<HTMLDivElement | null>(null)

const libraryPanelRef = useRef<HTMLDivElement | null>(null)

const resetPanelRef = useRef<HTMLDivElement | null>(null)

  const longPressTimer = useRef<number | null>(null)

  const [expandedDay, setExpandedDay] =
    useState<WeekDay | null>(null)

  const [editingDay, setEditingDay] =
    useState<WeekDay | null>(null)

  const [dayLabels, setDayLabels] =
    useState<Record<WeekDay, string>>(defaultLabels)

  const [planExpanded, setPlanExpanded] =
    useState(false)

  const [libraryOpen, setLibraryOpen] =
    useState(false)

  const [exerciseLibrary, setExerciseLibrary] =
    useState<string[]>([])

  const [suggestions, setSuggestions] =
    useState<string[]>([])

  /* ===== CLICK EFFECT ===== */

  const [clickEffect, setClickEffect] = useState<{
    x: number
    y: number
    key: number
  } | null>(null)

  function triggerClickEffect(
    e: React.MouseEvent
  ) {

    const rect =
      (e.currentTarget as HTMLElement).getBoundingClientRect()

    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    setClickEffect({
      x,
      y,
      key: Date.now()
    })

    setTimeout(() => {
      setClickEffect(null)
    }, 400)
  }

  const [dayExercises, setDayExercises] =
    useState<Record<WeekDay, ExerciseTemplate[]>>(
      weekDays.reduce((acc, day) => {
        acc[day] =
          weeklyPlan?.[day]?.exercises || []
        return acc
      }, {} as Record<WeekDay, ExerciseTemplate[]>)
    )

  const [tempInputs, setTempInputs] =
    useState<Record<WeekDay, TempInput>>(
      weekDays.reduce((acc, day) => {
        acc[day] = { name: "", sets: 0, reps: 0 }
        return acc
      }, {} as Record<WeekDay, TempInput>)
    )

  useEffect(() => {
    setExerciseLibrary(getExerciseLibrary())
  }, [])

 useEffect(() => {

  function handleClickOutside(e: MouseEvent) {

  const target = e.target as Node

  const insideDay =
    expandedDayRef.current?.contains(target)

  const insideTopBar =
    topBarRef.current?.contains(target)

  const insidePlan =
    planPanelRef.current?.contains(target)

  const insideLibrary =
    libraryPanelRef.current?.contains(target)

  const insideReset =
    resetPanelRef.current?.contains(target)

  if (
    insideDay ||
    insideTopBar ||
    insidePlan ||
    insideLibrary ||
    insideReset
  ) return

  setExpandedDay(null)
  setPlanExpanded(false)
  setLibraryOpen(false)
  setConfirmResetOpen(false)

}

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }

}, [])

  const handleNameChange = (day: WeekDay, value: string) => {

    setTempInputs({
      ...tempInputs,
      [day]: {
        ...tempInputs[day],
        name: value
      }
    })

    if (!value) {
      setSuggestions([])
      return
    }

    const results = searchExercises(value)

    setSuggestions(results.slice(0, 5))
  }

  const selectSuggestion = (day: WeekDay, value: string) => {

    setTempInputs({
      ...tempInputs,
      [day]: {
        ...tempInputs[day],
        name: value
      }
    })

    setSuggestions([])
  }

  const startLongPress = (day: WeekDay) => {
    longPressTimer.current = window.setTimeout(() => {
      setEditingDay(day)
    }, 500)
  }

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const toggleDay = (day: WeekDay) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  const addExercise = (day: WeekDay) => {

    const input = tempInputs[day]
    const name = input.name.trim()

    if (!name || !input.sets || !input.reps) return

    addExerciseToLibrary(name)
    setExerciseLibrary(getExerciseLibrary())

    const newExercise: ExerciseTemplate = {
      id: generateId(),
      name,
      sets: input.sets,
      reps: input.reps
    }

    const updatedExercises = [
      ...(dayExercises[day] || []),
      newExercise
    ]

    setDayExercises({
      ...dayExercises,
      [day]: updatedExercises
    })

    const routine: RoutineTemplate = {
      id: generateId(),
      name: dayLabels[day],
      exercises: updatedExercises
    }

    setRoutineForDay(day, routine)

    setTempInputs({
      ...tempInputs,
      [day]: { name: "", sets: 0, reps: 0 }
    })

    setSuggestions([])
  }

  const removeExercise = (day: WeekDay, id: string) => {

    const updatedExercises =
      dayExercises[day].filter(ex => ex.id !== id)

    setDayExercises({
      ...dayExercises,
      [day]: updatedExercises
    })

    const routine: RoutineTemplate = {
      id: generateId(),
      name: dayLabels[day],
      exercises: updatedExercises
    }

    setRoutineForDay(day, routine)
  }

  const removeFromLibrary = (name: string) => {

    removeExerciseFromLibrary(name)

    setExerciseLibrary(getExerciseLibrary())
  }

  const clearAllRoutines = () => {

    const empty: Record<WeekDay, ExerciseTemplate[]> =
      weekDays.reduce((acc, day) => {
        acc[day] = []
        return acc
      }, {} as Record<WeekDay, ExerciseTemplate[]>)

    setDayExercises(empty)

    weekDays.forEach(day => {

      const routine: RoutineTemplate = {
        id: generateId(),
        name: dayLabels[day],
        exercises: []
      }

      setRoutineForDay(day, routine)
    })
  }

  const allExercises = useMemo(() => {
    return Object.values(weeklyPlan || {})
      .filter(Boolean)
      .flatMap(r => r?.exercises ?? [])
  }, [weeklyPlan])

  const activeIds = allExercises.map(e => e.id)

  const activeObjectives =
    objectives.exercises.filter(o =>
      activeIds.includes(o.exerciseId)
    )

  const volumeBaseline = activeObjectives.reduce(
    (acc, ex) =>
      acc +
      ex.baselineWeights.reduce(
        (a, b) => a + (b || 0), 0),
    0
  )

  const volumeObjective = activeObjectives.reduce(
    (acc, ex) =>
      acc +
      ex.objectiveWeights.reduce(
        (a, b) => a + (b || 0), 0),
    0
  )

  const handleObjectiveChange = (
    exerciseId: string,
    index: number,
    value: number
  ) => {

    const objective =
      objectives.exercises.find(
        o => o.exerciseId === exerciseId
      )

    const current =
      objective?.objectiveWeights || []

    const updated = [...current]

    updated[index] = value

    setObjectiveWeights(exerciseId, updated)
  }

  return (


  <div style={containerStyle}>

    
    {/* RESTO DEL CONTENIDO */}
      {weekDays.map(day => {

        const isExpanded = expandedDay === day
        const isEditing = editingDay === day
        const exercises = dayExercises[day]

        return (
         <div
  key={day}
  ref={isExpanded ? expandedDayRef : null}
  style={dayContainerStyle(isExpanded)}
>

            <div
  style={headerStyle(isExpanded)}
  onClick={() => !isEditing && toggleDay(day)}
>

  {isEditing ? (

    <input
      autoFocus
      value={dayLabels[day]}
      onChange={(e)=>
        setDayLabels({
          ...dayLabels,
          [day]: e.target.value
        })
      }
      onBlur={()=>setEditingDay(null)}
      style={editableInputStyle}
    />

  ) : (

    <span
      onMouseDown={()=>startLongPress(day)}
      onMouseUp={clearLongPress}
      onTouchStart={()=>startLongPress(day)}
      onTouchEnd={clearLongPress}
    >
      {dayLabels[day]}
    </span>

  )}

</div>
{isExpanded && (

  <div style={expandedCardStyle}>

    <div style={inputRowStyle}>

      <input
        placeholder="Nombre"
        value={tempInputs[day].name}
        onChange={(e)=>
          handleNameChange(day,e.target.value)
        }
        style={nameInputStyle}
      />

      <input
        type="number"
        placeholder="Reps"
        value={tempInputs[day].reps || ""}
        onChange={(e)=>
          setTempInputs({
            ...tempInputs,
            [day]:{
              ...tempInputs[day],
              reps:Number(e.target.value)
            }
          })
        }
        style={smallInputStyle}
      />

      <input
        type="number"
        placeholder="Series"
        value={tempInputs[day].sets || ""}
        onChange={(e)=>
          setTempInputs({
            ...tempInputs,
            [day]:{
              ...tempInputs[day],
              sets:Number(e.target.value)
            }
          })
        }
        style={smallInputStyle}
      />

      <button
        onClick={()=>addExercise(day)}
        style={iconButtonStyle}
      >
        +
      </button>

    </div>

    {suggestions.length>0 && (
      <div style={autocompleteBoxStyle}>
        {suggestions.map(s=>(
          <div
            key={s}
            style={suggestionStyle}
            onClick={()=>selectSuggestion(day,s)}
          >
            {s}
          </div>
        ))}
      </div>
    )}

    {exercises.map(ex=>(
      <div key={ex.id} style={exerciseRowStyle}>
        <span>{ex.name} {ex.reps} x {ex.sets}</span>
        <button
          onClick={()=>removeExercise(day,ex.id)}
          style={iconButtonStyle}
        >
          -
        </button>
      </div>
    ))}

  </div>

)}
          </div>
          
        )
      })}

     {/* TOP BAR */}

    <div ref={topBarRef} style={topBarStyle}>

      <div
        onClick={(e)=>{
  triggerClickEffect(e)

  setPlanExpanded(prev => !prev)
  setLibraryOpen(false)
  setConfirmResetOpen(false)

}}
        style={planHeaderTopStyle}
      >
        Plan
      </div>

      <div style={{ display:"flex", gap:6 }}>

        <button
  onClick={(e)=>{
  triggerClickEffect(e)

  setLibraryOpen(prev => !prev)
  setConfirmResetOpen(false)
  setPlanExpanded(false)

}}
  style={clearButtonStyle}
>
  E
</button>

        <button
  onClick={(e)=>{
  triggerClickEffect(e)

  setConfirmResetOpen(prev => !prev)
  setLibraryOpen(false)
  setPlanExpanded(false)

}}
  style={clearButtonStyle}
>
  X
</button>

      </div>

    </div>

    {/* PANEL BIBLIOTECA */}

    {libraryOpen && (
  <div ref={libraryPanelRef} style={floatingPanelStyle}>

        {exerciseLibrary.length === 0 && (
          <div>No hay ejercicios guardados</div>
        )}

        {exerciseLibrary.map(ex => (
          <div key={ex} style={libraryRowStyle}>

            <span>{ex}</span>

            <button
              onClick={() => removeFromLibrary(ex)}
              style={iconButtonStyle}
            >
              -
            </button>

          </div>
        ))}

      </div>
    )}

   {confirmResetOpen && (

  <div ref={resetPanelRef} style={floatingPanelStyle}>

    <div style={{ textAlign:"center", marginBottom:16 }}>
      Iniciar Nueva Rutina
    </div>

    <div style={{
      display:"flex",
      justifyContent:"center",
      gap:20
    }}>

      <button
        onClick={()=>{
          clearAllRoutines()
          setConfirmResetOpen(false)
        }}
        style={confirmButtonStyle}
      >
        Si
      </button>

      <button
        onClick={()=>{
          setConfirmResetOpen(false)
        }}
        style={confirmButtonStyle}
      >
        No
      </button>

    </div>

  </div>

)}

 {/* PLAN */}

      <div
  ref={planPanelRef}
  style={planContainerStyle(planExpanded)}
>

        {planExpanded && (

          <div style={planExpandedCardStyle}>

            {allExercises.map(ex=>{

              const objective =
                objectives.exercises.find(
                  o => o.exerciseId === ex.id
                )

              return(
                <div key={ex.id} style={planExerciseRowStyle}>

                  <div>{ex.name}</div>

                  <div style={planRightColumnStyle}>

                    <div>
                      {objective?.baselineWeights?.length
                        ? objective.baselineWeights.join(" / ")
                        : "Sin información"}
                    </div>

                    <div>
                      {Array.from({length:ex.sets}).map((_,i)=>(
                        <input
                          key={i}
                          type="number"
                          value={
                            objective?.objectiveWeights?.[i] ?? ""
                          }
                          onChange={(e)=>
                            handleObjectiveChange(
                              ex.id,
                              i,
                              Number(e.target.value)
                            )
                          }
                          style={planInputStyle}
                        />
                      ))}
                    </div>

                  </div>

                </div>
              )
            })}

            <div>Volumen Baseline: {volumeBaseline}</div>
            <div>Volumen Objetivo: {volumeObjective}</div>

          </div>

        )}

      </div>


      {/* CLICK EFFECT */}

      {clickEffect && (
        <div
          key={clickEffect.key}
          style={{
            ...clickCircleStyle,
            left: clickEffect.x,
            top: clickEffect.y
          }}
        />
      )}

    </div>

  )
}

/* ================= STYLES ================= */

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 30,
  paddingTop: 40,
  fontFamily: "monospace"
}

const libraryButtonStyle : React.CSSProperties = {display:"flex",gap:6,cursor:"pointer"}

const dotStyle : React.CSSProperties = {
  width:3,height:3,borderRadius:"50%",background:"#000000"
}
const libraryPanelStyle : React.CSSProperties = {
  border:"1px solid #0000007a",borderRadius:10,padding:20,width:240
}

const libraryRowStyle : React.CSSProperties = {
  display:"flex",justifyContent:"space-between",marginBottom:8
}

const autocompleteBoxStyle: React.CSSProperties = {
  border:"1px solid #aaa",borderRadius:6,padding:6
}

const suggestionStyle: React.CSSProperties = {padding:4,cursor:"pointer"}
const dayContainerStyle = (expanded:boolean):React.CSSProperties=>({
  width: expanded ? 360 : 240,
  marginTop:10,
  transition:"all .3s ease",
  display:"flex",
  flexDirection:"column",
  alignItems:"center"
})

const headerStyle = (expanded:boolean):React.CSSProperties=>({
  width:"100%",
  background: expanded ? "#000" : "transparent",
  color: expanded ? "#fff" : "#000",
  border:"1px solid #8b8b8b",
  borderRadius:10,
  padding:"14px 20px",
  display:"flex",
  justifyContent:"space-between",
  cursor:"pointer"
})

const clearButtonStyle:React.CSSProperties={
  width:16,height:16,borderRadius:6,
  border:"1px solid #b8b8b8",
  background:"white",
  cursor:"pointer",
  fontSize:8
}

const topBarStyle:React.CSSProperties={
  width:190,
  marginTop:10,
  marginBottom:0,
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  borderRadius:10,
  padding:0,
}

const planHeaderTopStyle:React.CSSProperties={
  cursor:"pointer",
  fontSize:12
}

const planContainerStyle=(expanded:boolean):React.CSSProperties=>({
  width: expanded ? 360 : 240,
  transition:"all .3s ease",
  display:"flex",
  flexDirection:"column",
  alignItems:"center"
})

const planExpandedCardStyle:React.CSSProperties={
  width:"100%",
  marginTop:10,
  border:"1px solid #000",
  borderRadius:10,
  padding:20,
  display:"flex",
  flexDirection:"column",
  gap:30
}

const planExerciseRowStyle:React.CSSProperties={
  display:"flex",
  justifyContent:"space-between"
}

const planRightColumnStyle:React.CSSProperties={
  display:"flex",
  flexDirection:"column",
  alignItems:"flex-end",
  gap:6
}

const planInputStyle:React.CSSProperties={
  width:30,
  marginLeft:6,
  textAlign:"center",
  border:"1px solid #8b8b8bbd",
  borderRadius:6
}

const clickCircleStyle:React.CSSProperties={
  position:"fixed",
  width:30,
  height:30,
  borderRadius:"50%",
  background:"rgba(73, 73, 73, 0.75)",
  transform:"translate(-50%,-50%)",
  animation:"rippleAnim 0.8s ease-out",
  pointerEvents:"none"
}

const expandedCardStyle: React.CSSProperties = {
  width:"100%",
  marginTop:20,
  border:"1px solid #8b8b8b",
  borderRadius:10,
  padding:20,
  display:"flex",
  flexDirection:"column",
  gap:20
}

const inputRowStyle: React.CSSProperties = {
  display:"flex",
  alignItems:"center",
  gap:8
}

const nameInputStyle: React.CSSProperties = {
  flex:3,
  border:"1px solid #aaa",
  height:26,
  borderRadius:6,
  padding:"6px"
}

const smallInputStyle: React.CSSProperties = {
  width:40,
  height:26,
  border:"1px solid #aaa",
  borderRadius:6,
  textAlign:"center"
}

const iconButtonStyle: React.CSSProperties = {
  border:"1px solid #ffffff",
  background:"transparent",
  width:28,
  height:28,
  cursor:"pointer"
}

const exerciseRowStyle: React.CSSProperties = {
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center"
}

const editableInputStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  fontFamily: "monospace",
  fontSize: "inherit",
  background: "transparent",
  width: "100%"
}

const confirmButtonStyle: React.CSSProperties = {

  padding:"6px 14px",
  border:"1px solid #ffffff",
  borderRadius:6,
  background:"white",
  cursor:"pointer",
  fontFamily:"monospace"

}

const floatingPanelStyle: React.CSSProperties = {
  border: "1px solid #0000007a",
  borderRadius: 10,
  padding: 20,
  width: 240,
  animation: "panelFade 0.25s ease"
}