import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface DashboardStats {
  workouts_this_week: number;
  study_hours_this_week: number;
  current_study_streak: number;
  avg_mood_7days: number;
  water_avg_7days: number;
  focus_sessions_this_week: number;
  total_calories_burned_week: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>('Hello');

  /**
   * Coerce unknown API values into safe numbers.
   * Handles numbers, numeric strings, null/undefined, and other junk safely.
   */
  const toNumber = (value: unknown, fallback = 0): number => {
    const n =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : NaN;

    return Number.isFinite(n) ? n : fallback;
  };

  /**
   * Normalize API response into the exact numeric shape the UI expects.
   * This prevents runtime errors like: toFixed is not a function
   */
  const normalizeStats = (data: any): DashboardStats => ({
    workouts_this_week: toNumber(data?.workouts_this_week, 0),
    study_hours_this_week: toNumber(data?.study_hours_this_week, 0),
    current_study_streak: toNumber(data?.current_study_streak, 0),
    avg_mood_7days: toNumber(data?.avg_mood_7days, 5),
    water_avg_7days: toNumber(data?.water_avg_7days, 0),
    focus_sessions_this_week: toNumber(data?.focus_sessions_this_week, 0),
    total_calories_burned_week: toNumber(data?.total_calories_burned_week, 0),
  });

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://hak.hoi5.com/api/stats/overview', {
        method: 'GET',
        credentials: 'include', // Important for sending session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view dashboard');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Normalize to numbers so UI formatting/math never breaks
      setStats(normalizeStats(data));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (moodScore: number) => {
    if (moodScore >= 8) return '😊';
    if (moodScore >= 6) return '🙂';
    if (moodScore >= 4) return '😐';
    if (moodScore >= 2) return '😕';
    return '😞';
  };

  const getMoodText = (moodScore: number) => {
    if (moodScore >= 8) return 'Excellent';
    if (moodScore >= 6) return 'Good';
    if (moodScore >= 4) return 'Neutral';
    if (moodScore >= 2) return 'Low';
    return 'Poor';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!';
    if (streak < 3) return 'Keep going!';
    if (streak < 7) return 'Great consistency!';
    return 'Amazing dedication!';
  };

  const calculateProgress = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    return percentage;
  };

  if (loading) {
    return (
      <div className="dashboard-container container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container container">
        <div className="error-container">
          <h2>⚠️</h2>
          <p>{error}</p>
          <button onClick={fetchStats} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Safe derived numbers (stats already normalized, but keep fallbacks)
  const caloriesWeek = stats?.total_calories_burned_week ?? 0;
  const workoutsWeek = stats?.workouts_this_week ?? 0;

  const studyHours = stats?.study_hours_this_week ?? 0;
  const studyStreak = stats?.current_study_streak ?? 0;

  const avgMood = stats?.avg_mood_7days ?? 5;
  const waterAvg = stats?.water_avg_7days ?? 0;

  const focusSessions = stats?.focus_sessions_this_week ?? 0;

  return (
    <div className="dashboard-container container">
      <header className="dashboard-header">
        <h1>{greeting}, Alex! 👋</h1>
        <p>Here's your weekly overview.</p>
        <div className="last-updated">Updated just now</div>
      </header>

      <div className="dashboard-grid">
        {/* Fitness Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Fitness</h3>
            <span className="card-icon">🔥</span>
          </div>
          <p>Calories Burned This Week</p>
          <div className="stat-value">
            {caloriesWeek.toLocaleString()}
            <small className="stat-unit"> kcal</small>
          </div>
          <div className="stat-subtext">{workoutsWeek} workouts completed</div>
          <div className="progress-bar">
            <div
              className="progress-fill fitness"
              style={{ width: `${calculateProgress(caloriesWeek, 5000)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            <span>Goal: 5,000 kcal</span>
            <span>{calculateProgress(caloriesWeek, 5000).toFixed(0)}%</span>
          </div>
        </div>

        {/* Study Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Study</h3>
            <span className="card-icon">📚</span>
          </div>
          <p>Hours Focused This Week</p>
          <div className="stat-value">
            {studyHours.toFixed(1)}
            <small className="stat-unit"> hrs</small>
          </div>
          <div className="streak-badge">🔥 {studyStreak} day streak</div>
          <div className="stat-subtext">{getStreakMessage(studyStreak)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill study"
              style={{ width: `${calculateProgress(studyHours, 20)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            <span>Goal: 20 hours</span>
            <span>{calculateProgress(studyHours, 20).toFixed(0)}%</span>
          </div>
        </div>

        {/* Wellness Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Wellness</h3>
            <span className="card-icon">🧘</span>
          </div>
          <p>Average Mood (7 days)</p>
          <div className="stat-value">
            {getMoodEmoji(avgMood)}
            <span style={{ marginLeft: '0.5rem', fontSize: '2rem' }}>
              {avgMood.toFixed(1)}/10
            </span>
          </div>
          <div className="mood-text">{getMoodText(avgMood)}</div>
          <div className="focus-sessions">
            <span className="focus-label">Focus Sessions:</span>
            <span className="focus-count">{focusSessions}</span>
          </div>
        </div>

        {/* Water Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Hydration</h3>
            <span className="card-icon">💧</span>
          </div>
          <p>Daily Average (7 days)</p>
          <div className="stat-value">
            {waterAvg.toFixed(1)}
            <small className="stat-unit"> glasses</small>
          </div>
          <div className="water-cups">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`water-cup ${i < Math.floor(waterAvg) ? 'filled' : ''}`}
              >
                💧
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill water"
              style={{ width: `${calculateProgress(waterAvg, 8)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            <span>Goal: 8 glasses</span>
            <span>{calculateProgress(waterAvg, 8).toFixed(0)}%</span>
          </div>
        </div>

        {/* Tasks Card - Full Width */}
        <div className="dashboard-card tasks-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="refresh-button" onClick={fetchStats}>
              ↻ Refresh
            </button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🏋️</div>
              <div className="activity-content">
                <span className="activity-title">Workout Completed</span>
                <span className="activity-time">Today, 8:30 AM</span>
              </div>
              <div className="activity-calories">+320 kcal</div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">📖</div>
              <div className="activity-content">
                <span className="activity-title">Study Session</span>
                <span className="activity-time">Yesterday, 2 hours</span>
              </div>
              <div className="activity-calories">Focus +1</div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">😊</div>
              <div className="activity-content">
                <span className="activity-title">Mood Check-in</span>
                <span className="activity-time">Yesterday, 8/10</span>
              </div>
              <div className="activity-calories positive">Great!</div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">💧</div>
              <div className="activity-content">
                <span className="activity-title">Water Intake</span>
                <span className="activity-time">Yesterday, 7 glasses</span>
              </div>
              <div className="activity-calories">Almost there!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
