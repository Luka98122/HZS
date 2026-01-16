// Workout.tsx
import React, { useMemo, useState } from "react";
import "./Workout.css";

const API_BASE = "https://hak.hoi5.com/api";

type ApiError = {
  message?: string;
  detail?: string;
};

type StartWorkoutResponse = {
  session_id: string;
  start_time: string; // ISO
};

type LogExerciseResponse = {
  exercise_id: string;
  completed_at: string; // ISO
};

type CompleteWorkoutResponse = {
  total_duration: number; // minutes (assumed)
  total_calories: number;
};

type ExerciseTemplate = {
  id: string;
  order: number;
  name: string;
  tag: string;
  prescription: string; // display text
  defaults: {
    exercise_type: string;
    reps?: number;
    duration?: number; // seconds
    calories_burned?: number;
  };
  inputMode: "reps" | "duration" | "reps_or_duration";
};

type LoggedExercise = {
  templateId: string;
  exercise_type: string;
  reps?: number;
  duration?: number;
  calories_burned?: number;
  exercise_id: string;
  completed_at: string;
};

function safeNumber(v: string): number | undefined {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await res.json()) as ApiError;
    } catch {
      // ignore
    }
    const msg =
      payload?.message ||
      payload?.detail ||
      `Request failed (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

const Workout: React.FC = () => {
  const workoutTitle = "Bodyweight Circuit";
  const workoutSubtitle = "45 Min • Intermediate • Strength";

  /**
   * Calories model:
   * - For rep-based exercises: calories = reps * kcalPerRep
   * - For duration-based exercises: calories = seconds * kcalPerSecond
   *
   * Tune these constants to match your backend/product expectations.
   */
  const CALORIES_MODEL = useMemo(
    () => ({
      "Push-ups": { kcalPerRep: 0.35 },
      "Pull-ups": { kcalPerRep: 0.6 },
      "Bodyweight Squats": { kcalPerRep: 0.25 },
      Plank: { kcalPerSecond: 0.08 },
    }),
    []
  );

  const exerciseTemplates: ExerciseTemplate[] = useMemo(
    () => [
      {
        id: "push-ups",
        order: 1,
        name: "Push-ups",
        tag: "Bodyweight",
        prescription: "3 Sets × 15–30 Reps",
        defaults: { exercise_type: "Push-ups", reps: 15, calories_burned: 0 },
        inputMode: "reps",
      },
      {
        id: "pull-ups",
        order: 2,
        name: "Pull-ups",
        tag: "Bodyweight",
        prescription: "3 Sets × AMRAP",
        defaults: { exercise_type: "Pull-ups", reps: 0, calories_burned: 0 },
        inputMode: "reps",
      },
      {
        id: "bodyweight-squats",
        order: 3,
        name: "Bodyweight Squats",
        tag: "Bodyweight",
        prescription: "3 Sets × 20–30 Reps",
        defaults: { exercise_type: "Bodyweight Squats", reps: 20, calories_burned: 0 },
        inputMode: "reps",
      },
      {
        id: "plank",
        order: 4,
        name: "Plank",
        tag: "Core",
        prescription: "3 Sets × 30–60 sec",
        defaults: { exercise_type: "Plank", duration: 30, calories_burned: 0 },
        inputMode: "duration",
      },
    ],
    []
  );

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);

  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [logLoadingId, setLogLoadingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [logged, setLogged] = useState<Record<string, LoggedExercise[]>>({});

  // Inputs per template (calories is now computed, not editable)
  const [inputs, setInputs] = useState<
    Record<string, { reps: string; duration: string }>
  >(() => {
    const init: Record<string, { reps: string; duration: string }> = {};
    for (const t of exerciseTemplates) {
      init[t.id] = {
        reps: t.defaults.reps !== undefined ? String(t.defaults.reps) : "",
        duration: t.defaults.duration !== undefined ? String(t.defaults.duration) : "",
      };
    }
    return init;
  });

  const totalSets = 12;
  const estimatedKcal = 320;
  const isActive = sessionId !== null;

  const totalLoggedCount = useMemo(() => {
    return Object.values(logged).reduce((acc, arr) => acc + arr.length, 0);
  }, [logged]);

  const totalLoggedCalories = useMemo(() => {
    return Object.values(logged)
      .flat()
      .reduce((acc, e) => acc + (e.calories_burned ?? 0), 0);
  }, [logged]);

  function pushToast(msg: string) {
    setToast(msg);
    window.clearTimeout((pushToast as any)._t);
    (pushToast as any)._t = window.setTimeout(() => setToast(null), 2600);
  }

  function computeCalories(template: ExerciseTemplate): number {
    const reps = safeNumber(inputs[template.id]?.reps ?? "") ?? 0;
    const duration = safeNumber(inputs[template.id]?.duration ?? "") ?? 0;

    const model = (CALORIES_MODEL as any)[template.defaults.exercise_type];

    if (template.inputMode === "reps") {
      const kcalPerRep = model?.kcalPerRep ?? 0;
      return Math.max(0, Math.round(reps * kcalPerRep));
    }

    if (template.inputMode === "duration") {
      const kcalPerSecond = model?.kcalPerSecond ?? 0;
      return Math.max(0, Math.round(duration * kcalPerSecond));
    }

    // reps_or_duration: prefer reps if provided, else duration
    const kcalPerRep = model?.kcalPerRep ?? 0;
    const kcalPerSecond = model?.kcalPerSecond ?? 0;
    if (reps > 0) return Math.max(0, Math.round(reps * kcalPerRep));
    return Math.max(0, Math.round(duration * kcalPerSecond));
  }

  async function handleStartWorkout() {
    setError(null);
    setStarting(true);
    try {
      const data = await apiFetch<StartWorkoutResponse>("/workout/start", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setSessionId(data.session_id);
      setStartTime(data.start_time);
      setLogged({});
      pushToast("Workout started ✅");
    } catch (e: any) {
      setError(e?.message ?? "Failed to start workout.");
    } finally {
      setStarting(false);
    }
  }

  async function handleLogExercise(template: ExerciseTemplate) {
    if (!sessionId) {
      setError("Start the workout first.");
      return;
    }

    setError(null);
    setLogLoadingId(template.id);

    try {
      const reps = safeNumber(inputs[template.id]?.reps ?? "");
      const duration = safeNumber(inputs[template.id]?.duration ?? "");

      // Basic validation
      if (template.inputMode === "reps" && (reps === undefined || reps < 0)) {
        throw new Error("Please enter reps (0 or more).");
      }
      if (template.inputMode === "duration" && (duration === undefined || duration <= 0)) {
        throw new Error("Please enter a duration in seconds.");
      }

      const computedCalories = computeCalories(template);

      // Backend REQUIRES all fields — even if unused
      const payload = {
        exercise_type: template.defaults.exercise_type,
        reps: reps !== undefined ? Math.max(0, Math.floor(reps)) : 0,
        duration: duration !== undefined ? Math.max(0, Math.floor(duration)) : 0,
        calories_burned: computedCalories,
      };

      const data = await apiFetch<LogExerciseResponse>(
        `/workout/${encodeURIComponent(sessionId)}/exercise`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const entry: LoggedExercise = {
        templateId: template.id,
        exercise_type: payload.exercise_type,
        reps: payload.reps,
        duration: payload.duration,
        calories_burned: payload.calories_burned,
        exercise_id: data.exercise_id,
        completed_at : data.completed_at,
      };

      setLogged((prev) => {
        const cur = prev[template.id] ?? [];
        return { ...prev, [template.id]: [entry, ...cur] };
      });

      pushToast(`${template.name} logged ✅`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to log exercise.");
    } finally {
      setLogLoadingId(null);
    }
  }

  async function handleCompleteWorkout() {
    if (!sessionId) {
      setError("No active workout session.");
      return;
    }

    setError(null);
    setCompleting(true);

    try {
      const data = await apiFetch<CompleteWorkoutResponse>(
        `/workout/${encodeURIComponent(sessionId)}/complete`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      pushToast(`Workout complete 🎉 (${data.total_calories} kcal)`);
      setSessionId(null);
      setStartTime(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to complete workout.");
    } finally {
      setCompleting(false);
    }
  }

  function handleInputChange(templateId: string, key: "reps" | "duration", value: string) {
    setInputs((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [key]: value,
      },
    }));
  }

  return (
    <div className="workout-container container">
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <header className="workout-hero">
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{workoutTitle}</h1>
        <p style={{ fontSize: "1.2rem", color: "#e2e8f0" }}>{workoutSubtitle}</p>

        <div className="workout-stats">
          <div>
            <strong>Sets</strong>
            <div style={{ fontSize: "1.5rem" }}>{totalSets}</div>
          </div>
          <div>
            <strong>Kcal</strong>
            <div style={{ fontSize: "1.5rem" }}>
              {isActive ? totalLoggedCalories : estimatedKcal}
            </div>
          </div>
          <div>
            <strong>Logged</strong>
            <div style={{ fontSize: "1.5rem" }}>{totalLoggedCount}</div>
          </div>
        </div>

        <div className="workout-actions">
          {!isActive ? (
            <button
              className="btn btn-primary btn-large"
              style={{ marginTop: "2rem" }}
              onClick={handleStartWorkout}
              disabled={starting}
            >
              {starting ? "Starting..." : "Start Workout"}
            </button>
          ) : (
            <div className="active-row">
              <div
                className="session-pill"
                title={startTime ? `Started: ${new Date(startTime).toLocaleString()}` : ""}
              >
                <span className="dot" />
              </div>

              <button
                className="btn btn-primary btn-large"
                style={{ marginTop: "2rem" }}
                onClick={handleCompleteWorkout}
                disabled={completing}
              >
                {completing ? "Completing..." : "Complete Workout"}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
      </header>

      <h2 style={{ marginBottom: "1.5rem" }}>Exercises</h2>

      <div className="exercise-list">
        {exerciseTemplates.map((t) => {
          const isLogging = logLoadingId === t.id;
          const items = logged[t.id] ?? [];
          const computedCalories = computeCalories(t);

          return (
            <div key={t.id} className="exercise-item">
              <div style={{ fontSize: "2rem", width: "3rem", textAlign: "center" }}>{t.order}</div>

              <div className="exercise-info">
                <div className="exercise-title-row">
                  <h3 style={{ margin: 0 }}>{t.name}</h3>
                  <span className="tag">{t.tag}</span>
                </div>

                <div className="exercise-meta">{t.prescription}</div>

                <div className="exercise-form">
                  {(t.inputMode === "reps" || t.inputMode === "reps_or_duration") && (
                    <label className="field">
                      <span>Reps</span>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={t.id === "pull-ups" ? "AMRAP (enter reps)" : "e.g. 10"}
                        value={inputs[t.id]?.reps ?? ""}
                        onChange={(e) => handleInputChange(t.id, "reps", e.target.value)}
                        disabled={!isActive || isLogging}
                      />
                    </label>
                  )}

                  {(t.inputMode === "duration" || t.inputMode === "reps_or_duration") && (
                    <label className="field">
                      <span>Duration (sec)</span>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g. 60"
                        value={inputs[t.id]?.duration ?? ""}
                        onChange={(e) => handleInputChange(t.id, "duration", e.target.value)}
                        disabled={!isActive || isLogging}
                      />
                    </label>
                  )}

                  {/* Computed calories (read-only) */}
                  <label className="field">
                    <span>Calories (auto)</span>
                    <input
                      value={String(computedCalories)}
                      readOnly
                      className="readonly"
                      title="Calculated automatically from reps/duration"
                    />
                  </label>

                  <button
                    className="btn btn-secondary"
                    onClick={() => handleLogExercise(t)}
                    disabled={!isActive || isLogging}
                    title={!isActive ? "Start the workout first" : "Log this exercise"}
                  >
                    {isLogging ? "Logging..." : "Log Set"}
                  </button>
                </div>

                {items.length > 0 && (
                  <div className="logged-panel">
                    <div className="logged-header">
                      <strong>Logged</strong>
                      <span className="muted">
                        {items.length} {items.length === 1 ? "entry" : "entries"}
                      </span>
                    </div>

                    <ul className="logged-list">
                      {items.slice(0, 5).map((e) => (
                        <li key={e.exercise_id} className="logged-item">
                          <span className="logged-main">
                            {e.reps !== undefined && <span>{e.reps} reps</span>}
                            {e.duration !== undefined && <span>{e.duration}s</span>}
                            {e.calories_burned !== undefined && <span>{e.calories_burned} kcal</span>}
                          </span>
                          <span className="muted">
                            {(() => {
                              const date = new Date(e.completed_at)
                              console.log(date) // Server time is incorrect, need manual adjustment
                              date.setHours(date.getHours() + 1)
                              date.setMinutes(date.getMinutes()-1)
                              date.setSeconds(0, 0)
                              console.log(date)
                              return date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            })()}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {items.length > 5 && (
                      <div className="muted" style={{ marginTop: ".5rem" }}>
                        Showing last 5…
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Workout;
