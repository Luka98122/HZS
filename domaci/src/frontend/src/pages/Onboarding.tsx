import React, { useEffect, useMemo, useState } from 'react';
import './Onboarding.css';
import { Link, useNavigate } from 'react-router-dom';

type Goals = {
  waterGlassesPerDay: number;
  studyHoursPerWeek: number;
  caloriesBurnPerWeek: number;
};

const API_BASE = 'https://hak.hoi5.com/api';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [goals, setGoals] = useState<Goals>({
    waterGlassesPerDay: 8,
    studyHoursPerWeek: 10,
    caloriesBurnPerWeek: 2000,
  });

  // Separate "draft" strings so inputs can be temporarily empty while editing.
  const [draft, setDraft] = useState({
    waterGlassesPerDay: String(8),
    studyHoursPerWeek: String(10),
    caloriesBurnPerWeek: String(2000),
  });

  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedRecommendations, setSavedRecommendations] = useState<string | null>(null);

  const isStep2Valid = useMemo(() => {
    return (
      goals.waterGlassesPerDay >= 1 &&
      goals.studyHoursPerWeek >= 1 &&
      goals.caloriesBurnPerWeek >= 100
    );
  }, [goals]);

  const next = () => setStep((s) => clamp(s + 1, 1, 3));
  const back = () => setStep((s) => clamp(s - 1, 1, 3));

  const updateDraft =
    (key: keyof Goals) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  // Commit draft -> goals when leaving a field (clamp + non-zero mins).
  const commitField =
    (key: keyof Goals, min: number, max: number) =>
    () => {
      setDraft((prevDraft) => {
        const raw = prevDraft[key];

        // If empty (or invalid), revert to current goals value
        const parsed = raw === '' ? NaN : Number(raw);
        const nextValue = Number.isFinite(parsed) ? clamp(parsed, min, max) : goals[key];

        // Update goals and also normalize the draft text to what we committed
        setGoals((prevGoals) => ({
          ...prevGoals,
          [key]: nextValue,
        }));

        return {
          ...prevDraft,
          [key]: String(nextValue),
        };
      });
    };

  // Prefill from backend (if onboarding already exists)
  useEffect(() => {
    const loadExisting = async () => {
      setPrefillLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/onboarding`, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        // If not found, that's fine: user hasn't done onboarding yet
        if (res.status === 404) return;

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load onboarding data');
        }

        // Map backend JSON -> UI state (defensive reading)
        const physical = data?.physical_goals || {};
        const study = data?.study_goals || {};

        const water = Number(physical?.water_glasses_per_day);
        const calories = Number(physical?.calories_burn_per_week);
        const studyHours = Number(study?.study_hours_per_week);

        const nextGoals: Goals = {
          waterGlassesPerDay: Number.isFinite(water) ? clamp(water, 1, 30) : 8,
          caloriesBurnPerWeek: Number.isFinite(calories) ? clamp(calories, 50, 5000) : 150,
          studyHoursPerWeek: Number.isFinite(studyHours) ? clamp(studyHours, 1, 168) : 10,
        };

        setGoals(nextGoals);
        setDraft({
          waterGlassesPerDay: String(nextGoals.waterGlassesPerDay),
          studyHoursPerWeek: String(nextGoals.studyHoursPerWeek),
          caloriesBurnPerWeek: String(nextGoals.caloriesBurnPerWeek),
        });

        if (typeof data?.recommendations === 'string') {
          setSavedRecommendations(data.recommendations);
        }
      } catch (e: any) {
        setError(e?.message || 'Something went wrong loading onboarding data');
      } finally {
        setPrefillLoading(false);
      }
    };

    loadExisting();
  }, []);

  const submitOnboarding = async () => {
    setLoading(true);
    setError(null);

    // Normalize/commit all fields on submit so 0/empty can't be submitted.
    const normalized: Goals = {
      waterGlassesPerDay: clamp(Number(draft.waterGlassesPerDay) || goals.waterGlassesPerDay, 1, 30),
      studyHoursPerWeek: clamp(Number(draft.studyHoursPerWeek) || goals.studyHoursPerWeek, 1, 80),
      caloriesBurnPerWeek: clamp(Number(draft.caloriesBurnPerWeek) || goals.caloriesBurnPerWeek, 100, 20000),
    };

    setGoals(normalized);
    setDraft({
      waterGlassesPerDay: String(normalized.waterGlassesPerDay),
      studyHoursPerWeek: String(normalized.studyHoursPerWeek),
      caloriesBurnPerWeek: String(normalized.caloriesBurnPerWeek),
    });

    // Build payload that matches your existing backend structure
    const payload = {
      categories: ['physical', 'study'], // keep backend logic happy (optional but useful)
      physical_goals: {
        water_glasses_per_day: normalized.waterGlassesPerDay,
        calories_burn_per_week: normalized.caloriesBurnPerWeek,
      },
      study_goals: {
        study_hours_per_week: normalized.studyHoursPerWeek,
      },
      focus_goals: {},
      stress_goals: {},
    };

    try {
      const res = await fetch(`${API_BASE}/onboarding`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit onboarding');
      }

      if (typeof data?.recommendations === 'string') {
        setSavedRecommendations(data.recommendations);
      }

      setStep(3);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong submitting onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-steps" aria-label="Onboarding progress">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step-dot ${step === s ? 'active' : ''}`} aria-hidden="true" />
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {prefillLoading && <div className="alert alert-info">Loading your onboarding…</div>}

        {step === 1 && (
          <div className="step-content">
            <span className="welcome-icon" aria-hidden="true">
              👋
            </span>
            <h2>Welcome to Wellness Buddy</h2>
            <p>Let&apos;s set 3 quick targets to personalize your experience.</p>

            <div className="btn-row">
              <button className="btn btn-primary" onClick={next} disabled={prefillLoading}>
                Get Started
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <span className="welcome-icon" aria-hidden="true">
              🎯
            </span>
            <h2>Your Targets</h2>
            <p>Set something realistic — you can always adjust later.</p>

            <div className="form-grid">
              <label className="field">
                <span className="field-label">Glasses of water per day</span>
                <div className="field-control">
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={30}
                    value={draft.waterGlassesPerDay}
                    onChange={updateDraft('waterGlassesPerDay')}
                    onBlur={commitField('waterGlassesPerDay', 1, 30)}
                    inputMode="numeric"
                  />
                  <span className="field-suffix">glasses/day</span>
                </div>
                <span className="field-hint">Common range: 6–12</span>
              </label>

              <label className="field">
                <span className="field-label">Study hours per week</span>
                <div className="field-control">
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={80}
                    value={draft.studyHoursPerWeek}
                    onChange={updateDraft('studyHoursPerWeek')}
                    onBlur={commitField('studyHoursPerWeek', 1, 80)}
                    inputMode="numeric"
                  />
                  <span className="field-suffix">hrs/week</span>
                </div>
                <span className="field-hint">Try 5–20 to start</span>
              </label>

              <label className="field">
                <span className="field-label">Calories to burn per week</span>
                <div className="field-control">
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={20000}
                    step={50}
                    value={draft.caloriesBurnPerWeek}
                    onChange={updateDraft('caloriesBurnPerWeek')}
                    onBlur={commitField('caloriesBurnPerWeek', 100, 20000)}
                    inputMode="numeric"
                  />
                  <span className="field-suffix">kcal/week</span>
                </div>
                <span className="field-hint">Example: 100-500</span>
              </label>
            </div>

            <div className="btn-row">
              <button className="btn btn-tertiary" onClick={back} disabled={loading}>
                Back
              </button>

              <button
                className="btn btn-primary"
                onClick={submitOnboarding}
                disabled={!isStep2Valid || loading}
                title={!isStep2Valid ? 'Please enter valid targets' : undefined}
              >
                {loading ? 'Saving…' : 'Finish'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <span className="welcome-icon" aria-hidden="true">
              🚀
            </span>
            <h2>You&apos;re All Set!</h2>

            <p className="summary">
              <strong>Your targets:</strong>
              <br />
              {goals.waterGlassesPerDay} glasses/day • {goals.studyHoursPerWeek} hrs/week •{' '}
              {goals.caloriesBurnPerWeek} kcal/week
            </p>

            {savedRecommendations && (
              <div className="recommendations">
                <h3>Recommendations</h3>
                <p>{savedRecommendations}</p>
              </div>
            )}

            <div className="btn-row">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
