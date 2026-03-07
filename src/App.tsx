import ExecuteRoutine from "./pages/ExecuteRoutine"
import CreateRoutine from "./pages/CreateRoutine"
import History from "./pages/History"
import Progress from "./pages/Progress"
import ExerciseHistory from "./pages/ExerciseHistory"

export default function App() {
  return (
    <div
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        fontFamily: "'Courier New', monospace",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          padding: "60px 0px 80px 0px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 120   // 👈 separación entre secciones
        }}
      >

         <section>
          <CreateRoutine />
        </section>
        <section>
          <ExecuteRoutine />
        </section>
        <section>
          <Progress />
        </section>
        <section>
          <ExerciseHistory />
        </section>

        <section>
          <History />
        </section>
      </div>
    </div>
  )
}