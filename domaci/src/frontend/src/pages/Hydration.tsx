import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Hydration.css";

type WeekEntry = {
  date: string; // expected: YYYY-MM-DD (or ISO). We'll display a friendly label.
  glasses: number;
};

const API_BASE = "https://hak.hoi5.com/api/"; 
const Hydration: React.FC = () => {
  const [todayGlasses, setTodayGlasses] = useState<number>(0);
  const [week, setWeek] = useState<WeekEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [addAmount, setAddAmount] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const goal = 8; // simple default (can later come from onboarding/account)

  const progressPct = useMemo(() => {
    const pct = (todayGlasses / goal) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [todayGlasses, goal]);

  const todayYMD = () => {
    // Local date -> YYYY-MM-DD
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateLabel = (dateStr: string) => {
    // Accept YYYY-MM-DD or ISO string
    const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const fetchToday = async () => {
    const res = await fetch(`${API_BASE}/water/today`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      // if not logged in, backend likely returns 401
      throw new Error(`Failed to load today's water (${res.status})`);
    }

    const data = await res.json();

    // Expecting: { glasses: number } OR plain number OR { count: number } depending on backend.
    // We'll handle a few common shapes safely.
    const glasses =
      typeof data === "number"
        ? data
        : typeof data?.glasses === "number"
        ? data.glasses
        : typeof data?.count === "number"
        ? data.count
        : 0;

    setTodayGlasses(glasses);
  };

  const fetchWeek = async () => {
    const res = await fetch(`${API_BASE}/water/week`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to load weekly water (${res.status})`);
    }

    const data = await res.json();

    // Expecting: Array<{date, glasses}>
    const normalized: WeekEntry[] = Array.isArray(data)
      ? data
          .map((x: any) => ({
            date: String(x?.date ?? ""),
            glasses: Number(x?.glasses ?? 0),
          }))
          .filter((x) => x.date)
      : [];

    setWeek(normalized);
  };

  const load = async () => {
    setLoading(true);
    clearMessages();
    try {
      await Promise.all([fetchToday(), fetchWeek()]);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong loading hydration data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addWater = async (glassesToAdd: number) => {
    if (!Number.isFinite(glassesToAdd) || glassesToAdd <= 0) return;

    setSubmitting(true);
    clearMessages();

    try {
      const newTotal = todayGlasses + glassesToAdd;

      const res = await fetch(`${API_BASE}/water`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          glasses: newTotal,
          date: todayYMD(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to log water (${res.status})`);
      }

      setTodayGlasses(newTotal);
      setSuccess(`Logged +${glassesToAdd} glass${glassesToAdd === 1 ? "" : "es"}!`);

      // Refresh week so the chart/list updates immediately
      await fetchWeek();
    } catch (e: any) {
      setError(e?.message ?? "Could not log water.");
    } finally {
      setSubmitting(false);
    }
  };

  const quickAdd = (n: number) => addWater(n);

  return (
    <div className="hydration-page">
      <div className="hydration-header">
        <div>
          <h1 className="hydration-title">Hydration</h1>
          <p className="hydration-subtitle">Log your water intake and stay on track 💧</p>
        </div>

        <div className="hydration-header-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="hydration-card">
          <p className="hydration-muted">Loading hydration data…</p>
        </div>
      ) : (
        <>
          {(error || success) && (
            <div className={`hydration-toast ${error ? "is-error" : "is-success"}`}>
              {error || success}
            </div>
          )}

          <div className="hydration-grid">
            {/* Today */}
            <div className="hydration-card">
              <div className="hydration-card-header">
                <h2 className="hydration-card-title">Today</h2>
                <span className="hydration-pill">
                  {todayGlasses} / {goal} glasses
                </span>
              </div>

              <div className="hydration-progress">
                <div className="hydration-progress-bar">
                  <div
                    className="hydration-progress-fill"
                    style={{ width: `${progressPct}%` }}
                    aria-label="Hydration progress"
                  />
                </div>
                <div className="hydration-progress-meta">
                  <span className="hydration-muted">
                    {progressPct.toFixed(0)}% of goal
                  </span>
                  <span className="hydration-muted">{todayYMD()}</span>
                </div>
              </div>

              <div className="hydration-actions">
                <button
                  className="hydration-quick"
                  onClick={() => quickAdd(1)}
                  disabled={submitting}
                >
                  +1
                </button>
                <button
                  className="hydration-quick"
                  onClick={() => quickAdd(2)}
                  disabled={submitting}
                >
                  +2
                </button>
                <button
                  className="hydration-quick"
                  onClick={() => quickAdd(3)}
                  disabled={submitting}
                >
                  +3
                </button>

                <div className="hydration-divider" />

                <div className="hydration-custom">
                  <label className="hydration-label" htmlFor="addAmount">
                    Add glasses
                  </label>
                  <div className="hydration-custom-row">
                    <input
                      id="addAmount"
                      className="hydration-input"
                      type="number"
                      min={1}
                      max={30}
                      value={addAmount}
                      onChange={(e) => setAddAmount(Number(e.target.value))}
                      disabled={submitting}
                    />
                    <button
                      className="btn btn-primary hydration-log-btn"
                      onClick={() => addWater(addAmount)}
                      disabled={submitting || addAmount <= 0}
                    >
                      {submitting ? "Logging…" : "Log"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Week */}
            <div className="hydration-card">
              <div className="hydration-card-header">
                <h2 className="hydration-card-title">Last 7 Days</h2>
                <button className="btn btn-secondary hydration-refresh" onClick={load}>
                  Refresh
                </button>
              </div>

              {week.length === 0 ? (
                <p className="hydration-muted">No water logs yet for this week.</p>
              ) : (
                <div className="hydration-week-list">
                  {week.map((entry) => (
                    <div className="hydration-week-row" key={entry.date}>
                      <div className="hydration-week-left">
                        <span className="hydration-week-date">{formatDateLabel(entry.date)}</span>
                        <div className="hydration-mini-bar">
                          <div
                            className="hydration-mini-fill"
                            style={{
                              width: `${Math.max(0, Math.min(100, (entry.glasses / goal) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="hydration-week-right">
                        <span className="hydration-week-glasses">{entry.glasses}</span>
                        <span className="hydration-muted">glasses</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="hydration-footnote">
                Tip: Aim for steady intake throughout the day—especially around workouts.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Hydration;
