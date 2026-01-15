import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import { Link, useNavigate } from 'react-router-dom';

interface DashboardStats {
  workouts_this_week: number;
  study_hours_this_week: number;
  current_study_streak: number;
  avg_mood_7days: number;
  water_avg_7days: number;
  focus_sessions_this_week: number;
  total_calories_burned_week: number;
}

interface User {
    full_name: string;
    email: string;
    username: string;
}

interface AccountData {
  id?: number;
  username?: string;
  email?: string;
  full_name?: string;
}

interface WaterTodayResponse {
  glasses?: number;
  total_glasses?: number;
  count?: number;
}

interface WaterWeekEntry {
  date: string; // YYYY-MM-DD
  glasses: number;
}

interface MoodEntry {
  id?: number;
  mood_score: number; // API says 1-5, but UI historically shows /10; we convert below.
  notes?: string;
  created_at?: string;
  date?: string;
}

interface StudyStreakResponse {
  current_streak?: number;
  longest_streak?: number;
}

interface StudyTask {
  id: number;
  task_name: string;
  estimated_time?: number;
  actual_time?: number;
  completed?: boolean;
  created_at?: string;
}

interface StudyTasksResponse {
  pending?: StudyTask[];
  completed?: StudyTask[];
}

interface StudyHistoryItem {
  id?: number;
  start_time?: string;
  end_time?: string;
  total_duration?: number; // seconds
  distractions?: number;
  pomodoros?: number;
}

interface WorkoutHistoryItem {
  id?: number;
  start_time?: string;
  end_time?: string;
  total_duration?: number; // seconds
  total_calories_burned?: number;
  exercises?: Array<{
    id?: number;
    exercise_type?: string;
    reps?: number;
    duration?: number;
    calories_burned?: number;
    completed_at?: string;
  }>;
}

interface FocusHistoryItem {
  id?: number;
  session_type?: string;
  duration?: number; // minutes or seconds depending on backend; we display raw if unsure
  breathing_pattern?: string;
  ambient_sound?: string;
  completed_at?: string;
  created_at?: string;
}

interface GratitudeEntry {
  id?: number;
  entry_text?: string;
  date?: string;
  created_at?: string;
}

interface JournalEntry {
  id?: number;
  entry_text?: string;
  created_at?: string;
}

type ActivityItem = {
  key: string;
  icon: string;
  title: string;
  timeLabel: string;
  rightLabel?: string;
  rightClassName?: string;
  sortTime: number; // ms epoch for sorting
};

interface GoalsResponse {
  water_per_day_glasses?: number;
  calories_per_week?: number;       // if you store it
  workouts_per_week?: number;      // if you store it
  study_hours_per_week?: number;   // if you store it
  calories_burn_goal_week?: number; // optional if you return it directly
  water_goal_glasses?: number;      // optional alias
}

type GoalsNormalized = {
  waterPerDay: number;       // glasses
  caloriesBurnWeek: number;  // kcal (target burn/week)
  studyHoursWeek: number;    // hours
};


const Dashboard: React.FC = () => {
  const API_BASE = 'https://hak.hoi5.com/api';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);

  const [waterToday, setWaterToday] = useState<number>(0);
  const [waterWeek, setWaterWeek] = useState<WaterWeekEntry[]>([]);

  const [moodRecent, setMoodRecent] = useState<MoodEntry[]>([]);
  const [moodAverageWeek, setMoodAverageWeek] = useState<number>(0);

  const [studyStreak, setStudyStreak] = useState<StudyStreakResponse | null>(null);
  const [studyTasks, setStudyTasks] = useState<StudyTasksResponse | null>(null);
  const [studyHistory, setStudyHistory] = useState<StudyHistoryItem[]>([]);

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [focusHistory, setFocusHistory] = useState<FocusHistoryItem[]>([]);

  const [gratitudeRecent, setGratitudeRecent] = useState<GratitudeEntry[]>([]);
  const [journalRecent, setJournalRecent] = useState<JournalEntry[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [greeting, setGreeting] = useState<string>('Hello');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const [goals, setGoals] = useState<GoalsNormalized>({
    waterPerDay: 8,
    caloriesBurnWeek: 5000,
    studyHoursWeek: 20,
  });


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
   * Normalize /stats/overview response into the exact numeric shape the UI expects.
   */
  const normalizeStats = (data: any): DashboardStats => ({
    workouts_this_week: toNumber(data?.workouts_this_week, 0),
    study_hours_this_week: toNumber(data?.study_hours_this_week, 0),
    current_study_streak: toNumber(data?.current_study_streak, 0),
    // backend is 1-5 for mood; overview route currently returns avg as-is
    // we’ll keep this value but convert to /10 when displaying to preserve existing UI.
    avg_mood_7days: toNumber(data?.avg_mood_7days, 0),
    water_avg_7days: toNumber(data?.water_avg_7days, 0),
    focus_sessions_this_week: toNumber(data?.focus_sessions_this_week, 0),
    total_calories_burned_week: toNumber(data?.total_calories_burned_week, 0),
  });

  useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user data", error);
            }
        }
    }, [navigate]);


  const apiFetch = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let message = `Error: ${res.status}`;
      try {
        const err = await res.json();
        if (err?.error) message = err.error;
      } catch {
        // ignore
      }
      if (res.status === 401) message = 'Please log in to view dashboard';
      throw new Error(message);
    }

    return (await res.json()) as T;
  };

  const formatRelativeTime = (iso?: string): { label: string; sortTime: number } => {
    if (!iso) return { label: '—', sortTime: 0 };
    const d = new Date(iso);
    const t = d.getTime();
    if (!Number.isFinite(t)) return { label: '—', sortTime: 0 };

    const now = Date.now();
    const diff = now - t;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return { label: 'Just now', sortTime: t };
    if (minutes < 60) return { label: `${minutes} min ago`, sortTime: t };
    if (hours < 24) return { label: `${hours} hr ago`, sortTime: t };
    if (days === 1) return { label: 'Yesterday', sortTime: t };
    return { label: d.toLocaleDateString(), sortTime: t };
  };

  const secondsToHours = (seconds?: number) => {
    const s = toNumber(seconds, 0);
    return s > 0 ? s / 3600 : 0;
  };

  const calculateProgress = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    return percentage;
  };

  // Mood conversion: backend 1–5 -> UI 0–10 (multiply by 2)
  const moodToTen = (mood1to5: number) => {
    const v = toNumber(mood1to5, 0);
    const clamped = Math.max(0, Math.min(v, 5));
    return clamped * 2;
  };

  const getMoodEmoji = (moodScoreTenScale: number) => {
    if (moodScoreTenScale >= 8) return '😊';
    if (moodScoreTenScale >= 6) return '🙂';
    if (moodScoreTenScale >= 4) return '😐';
    if (moodScoreTenScale >= 2) return '😕';
    return '😞';
  };

  const getMoodText = (moodScoreTenScale: number) => {
    if (moodScoreTenScale >= 8) return 'Excellent';
    if (moodScoreTenScale >= 6) return 'Good';
    if (moodScoreTenScale >= 4) return 'Neutral';
    if (moodScoreTenScale >= 2) return 'Low';
    return 'Poor';
  };

  const getStreakMessage = (streakDays: number) => {
    if (streakDays === 0) return 'Start your streak today!';
    if (streakDays < 3) return 'Keep going!';
    if (streakDays < 7) return 'Great consistency!';
    return 'Amazing dedication!';
  };

  const displayName = useMemo(() => {
    const full = account?.full_name?.trim();
    if (full) return full;
    if (user) return user.full_name;
    return 'there';
  }, [account]);

  const fetchAllDashboardData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      // Core data required for the top of the dashboard
      const [accountRes, overviewRes] = await Promise.all([
        apiFetch<AccountData>('/account'),
        apiFetch<any>('/stats/overview'),
      ]);

      setAccount(accountRes);
      setStats(normalizeStats(overviewRes));

      // Everything else powers dashboard widgets and “recent activity”
      const [
        waterTodayRes,
        waterWeekRes,
        moodRecentRes,
        moodAvgRes,
        streakRes,
        tasksRes,
        studyHistRes,
        workoutHistRes,
        focusHistRes,
        gratitudeRes,
        journalRes,
        goalsRes,
      ] = await Promise.allSettled([
        apiFetch<WaterTodayResponse>('/water/today'),
        apiFetch<any>('/water/week'),
        apiFetch<any>('/mood/recent'),
        apiFetch<any>('/mood/average'),
        apiFetch<StudyStreakResponse>('/study/streak'),
        apiFetch<StudyTasksResponse>('/study/tasks'),
        apiFetch<any>('/study/history'),
        apiFetch<any>('/workout/history'),
        apiFetch<any>('/focus/history'),
        apiFetch<any>('/gratitude/recent'),
        apiFetch<any>('/journal/recent'),
        apiFetch<GoalsResponse>('/goals'),
      ]);

      // Water today
      if (waterTodayRes.status === 'fulfilled') {
        const wt = waterTodayRes.value;
        setWaterToday(
          toNumber(wt?.glasses ?? wt?.total_glasses ?? wt?.count, 0)
        );
      } else {
        setWaterToday(0);
      }

      // Water week
      if (waterWeekRes.status === 'fulfilled') {
        const data = waterWeekRes.value;
        const arr: any[] = Array.isArray(data) ? data : data?.entries ?? data?.week ?? [];
        const normalized: WaterWeekEntry[] = (Array.isArray(arr) ? arr : []).map((x) => ({
          date: String(x?.date ?? ''),
          glasses: toNumber(x?.glasses, 0),
        }));
        setWaterWeek(normalized);
      } else {
        setWaterWeek([]);
      }

      // Mood recent (last 14)
      if (moodRecentRes.status === 'fulfilled') {
        const data = moodRecentRes.value;
        const arr: any[] = Array.isArray(data) ? data : data?.entries ?? data?.recent ?? [];
        const normalized: MoodEntry[] = (Array.isArray(arr) ? arr : [])
          .map((x) => ({
            id: x?.id,
            mood_score: toNumber(x?.mood_score, 0),
            notes: x?.notes,
            created_at: x?.created_at,
            date: x?.date,
          }))
          .filter((x) => x.mood_score > 0);
        setMoodRecent(normalized);
      } else {
        setMoodRecent([]);
      }

      // Mood weekly average
      if (moodAvgRes.status === 'fulfilled') {
        const data = moodAvgRes.value;
        // Could be { average: number } or plain number depending on implementation
        const avg = toNumber((data as any)?.average ?? data, 0);
        setMoodAverageWeek(avg);
      } else {
        setMoodAverageWeek(0);
      }

      // Study streak
      if (streakRes.status === 'fulfilled') setStudyStreak(streakRes.value);
      else setStudyStreak(null);

      // Study tasks
      if (tasksRes.status === 'fulfilled') setStudyTasks(tasksRes.value);
      else setStudyTasks(null);

      // Study history
      if (studyHistRes.status === 'fulfilled') {
        const data = studyHistRes.value;
        const arr: any[] = Array.isArray(data) ? data : data?.sessions ?? data?.history ?? [];
        const normalized: StudyHistoryItem[] = (Array.isArray(arr) ? arr : []).map((x) => ({
          id: x?.id,
          start_time: x?.start_time,
          end_time: x?.end_time,
          total_duration: toNumber(x?.total_duration, 0),
          distractions: toNumber(x?.distractions, 0),
          pomodoros: toNumber(x?.pomodoros, 0),
        }));
        setStudyHistory(normalized);
      } else {
        setStudyHistory([]);
      }

      // Workout history
      if (workoutHistRes.status === 'fulfilled') {
        const data = workoutHistRes.value;
        const arr: any[] = Array.isArray(data) ? data : data?.workouts ?? data?.history ?? [];
        const normalized: WorkoutHistoryItem[] = (Array.isArray(arr) ? arr : []).map((x) => ({
          id: x?.id,
          start_time: x?.start_time,
          end_time: x?.end_time,
          total_duration: toNumber(x?.total_duration, 0),
          total_calories_burned: toNumber(x?.total_calories_burned ?? x?.total_calories, 0),
          exercises: Array.isArray(x?.exercises) ? x.exercises : [],
        }));
        setWorkoutHistory(normalized);
      } else {
        setWorkoutHistory([]);
      }

      // Focus history
      if (focusHistRes.status === 'fulfilled') {
        const data = focusHistRes.value;
        const arr: any[] = Array.isArray(data) ? data : data?.sessions ?? data?.history ?? [];
        const normalized: FocusHistoryItem[] = (Array.isArray(arr) ? arr : []).map((x) => ({
          id: x?.id,
          session_type: x?.session_type,
          duration: toNumber(x?.duration, 0),
          breathing_pattern: x?.breathing_pattern,
          ambient_sound: x?.ambient_sound,
          completed_at: x?.completed_at,
          created_at: x?.created_at,
        }));
        setFocusHistory(normalized);
      } else {
        setFocusHistory([]);
      }

      // Gratitude recent
      if (gratitudeRes.status === 'fulfilled') {
        const data = gratitudeRes.value;
        const arr: any[] = Array.isArray(data) ? data : data?.entries ?? data?.recent ?? [];
        const normalized: GratitudeEntry[] = (Array.isArray(arr) ? arr : []).map((x) => ({
          id: x?.id,
          entry_text: x?.entry_text,
          date: x?.date,
          created_at: x?.created_at,
        }));
        setGratitudeRecent(normalized);
      } else {
        setGratitudeRecent([]);
      }

      // Journal recent
      if (journalRes.status === 'fulfilled') {
        const data = journalRes.value;
        const arr: any[] = Array.isArray(data) ? data : data?.entries ?? data?.recent ?? [];
        const normalized: JournalEntry[] = (Array.isArray(arr) ? arr : []).map((x) => ({
          id: x?.id,
          entry_text: x?.entry_text,
          created_at: x?.created_at,
        }));
        setJournalRecent(normalized);
      } else {
        setJournalRecent([]);
      }

      // Goals
      if (goalsRes.status === 'fulfilled') {
        const g = goalsRes.value;

        // water goal
        const waterPerDay = toNumber(
          g?.water_per_day_glasses ?? g?.water_per_day_glasses,
          8
        );

        // Study weekly goal (optional, fallback to 20)
        const studyHoursWeek = toNumber(g?.study_hours_per_week, 20);

        // Calories burned goal: if backend only stores calories/day, we can infer a week goal
        // Otherwise, if you return calories_burn_goal_week directly, use it.
        const caloriesBurnWeek =
          (toNumber(g?.calories_per_week, 0) > 0 ? toNumber(g.calories_per_week, 0) : 400);
        console.log(waterPerDay);
        console.log(caloriesBurnWeek);
        console.log(studyHoursWeek);
        console.log(g);
        setGoals({
          waterPerDay,
          caloriesBurnWeek,
          studyHoursWeek,
        });
      } else {
        // Keep defaults
        setGoals({ waterPerDay: 8, caloriesBurnWeek: 400, studyHoursWeek: 20 });
      }

      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
      // eslint-disable-next-line no-console
      console.error('Error loading dashboard:', err);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Good morning');
    else if (currentHour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchAllDashboardData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Build Recent Activity from real endpoints ---
  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    // Most recent workout
    const lastWorkout = workoutHistory?.[0];
    if (lastWorkout?.start_time) {
      const rel = formatRelativeTime(lastWorkout.start_time);
      items.push({
        key: `workout-${lastWorkout.id ?? 'last'}`,
        icon: '🏋️',
        title: 'Workout session',
        timeLabel: rel.label,
        rightLabel:
          lastWorkout.total_calories_burned && lastWorkout.total_calories_burned > 0
            ? `+${Math.round(lastWorkout.total_calories_burned)} kcal`
            : undefined,
        sortTime: rel.sortTime,
      });
    }

    // Most recent study session
    const lastStudy = studyHistory?.[0];
    if (lastStudy?.start_time) {
      const rel = formatRelativeTime(lastStudy.start_time);
      const hrs = secondsToHours(lastStudy.total_duration);
      items.push({
        key: `study-${lastStudy.id ?? 'last'}`,
        icon: '📚',
        title: 'Study session',
        timeLabel: rel.label,
        rightLabel: hrs > 0 ? `${hrs.toFixed(1)} hrs` : undefined,
        sortTime: rel.sortTime,
      });
    }

    // Most recent focus session
    const lastFocus = focusHistory?.[0];
    const focusTime = lastFocus?.completed_at || lastFocus?.created_at;
    if (focusTime) {
      const rel = formatRelativeTime(focusTime);
      items.push({
        key: `focus-${lastFocus.id ?? 'last'}`,
        icon: '🧠',
        title: lastFocus.session_type ? `Focus: ${lastFocus.session_type}` : 'Focus session',
        timeLabel: rel.label,
        rightLabel:
          lastFocus.duration && lastFocus.duration > 0 ? `${lastFocus.duration} min` : undefined,
        sortTime: rel.sortTime,
      });
    }

    // Most recent mood entry
    const lastMood = moodRecent?.[0];
    const moodTime = lastMood?.created_at || lastMood?.date;
    if (lastMood?.mood_score) {
      const rel = moodTime ? formatRelativeTime(moodTime) : { label: '—', sortTime: 0 };
      const score10 = moodToTen(lastMood.mood_score);
      items.push({
        key: `mood-${lastMood.id ?? 'last'}`,
        icon: '😊',
        title: 'Mood check-in',
        timeLabel: rel.label,
        rightLabel: `${score10.toFixed(0)}/10`,
        rightClassName: score10 >= 7 ? 'positive' : undefined,
        sortTime: rel.sortTime,
      });
    }

    // Water today (not timestamped, but still useful)
    items.push({
      key: 'water-today',
      icon: '💧',
      title: 'Water today',
      timeLabel: 'Today',
      rightLabel: `${waterToday} glasses`,
      sortTime: Date.now() - 1, // keep it near top if nothing else
    });

    // Gratitude entry (most recent)
    const lastGrat = gratitudeRecent?.[0];
    if (lastGrat?.date || lastGrat?.created_at) {
      const rel = formatRelativeTime(lastGrat.created_at || lastGrat.date);
      items.push({
        key: `gratitude-${lastGrat.id ?? 'last'}`,
        icon: '🙏',
        title: 'Gratitude entry',
        timeLabel: rel.label,
        rightLabel: lastGrat.entry_text ? 'Added' : undefined,
        sortTime: rel.sortTime,
      });
    }

    // Journal entry (most recent)
    const lastJournal = journalRecent?.[0];
    if (lastJournal?.created_at) {
      const rel = formatRelativeTime(lastJournal.created_at);
      items.push({
        key: `journal-${lastJournal.id ?? 'last'}`,
        icon: '📝',
        title: 'Journal entry',
        timeLabel: rel.label,
        rightLabel: 'Saved',
        sortTime: rel.sortTime,
      });
    }

    // Sort newest first and keep the top 6
    return items
      .filter((x) => x.title && x.timeLabel)
      .sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0))
      .slice(0, 6);
  }, [workoutHistory, studyHistory, focusHistory, moodRecent, waterToday, gratitudeRecent, journalRecent]);

  // --- Derived numbers (safe) ---
  const caloriesWeek = stats?.total_calories_burned_week ?? 0;
  const workoutsWeek = stats?.workouts_this_week ?? 0;

  const studyHours = stats?.study_hours_this_week ?? 0;
  const overviewStreak = stats?.current_study_streak ?? 0;

  // Prefer /mood/average if available; fall back to overview avg
  const avgMood1to5 = moodAverageWeek > 0 ? moodAverageWeek : stats?.avg_mood_7days ?? 0;
  const avgMood10 = moodToTen(avgMood1to5);

  const waterAvg = stats?.water_avg_7days ?? 0;
  const focusSessions = stats?.focus_sessions_this_week ?? 0;

  // Prefer /study/streak current/longest if present
  const currentStreak = toNumber(studyStreak?.current_streak, overviewStreak);
  const longestStreak = toNumber(studyStreak?.longest_streak, currentStreak);

  const pendingTasksCount = studyTasks?.pending?.length ?? 0;
  const completedTasksCount = studyTasks?.completed?.length ?? 0;

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

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
          <button onClick={() => fetchAllDashboardData(true)} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container container">
      <header className="dashboard-header">
        <h1>
          {greeting}, {displayName}! 👋
        </h1>
        <p>Here&apos;s your weekly overview.</p>
        <div className="last-updated">
          {refreshing ? 'Refreshing…' : `Updated at ${lastUpdatedLabel}`}
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Fitness Card */}
        <div className="dashboard-card" onClick={() => window.location.href="/workout"}>
          <div className="card-header">
            <h3>Fitness</h3>
            <span className="card-icon">🔥</span>
          </div>
          <p>Calories Burned This Week</p>
          <div className="stat-value">
            {Math.round(caloriesWeek).toLocaleString()}
            <small className="stat-unit"> kcal</small>
          </div>
          <div className="stat-subtext">{workoutsWeek} workouts completed</div>
          <div className="progress-bar">
            <div
              className="progress-fill fitness"
              style={{ width: `${calculateProgress(caloriesWeek, goals.caloriesBurnWeek)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            <span>Goal: 5,000 kcal</span>
            <span>{calculateProgress(caloriesWeek, goals.caloriesBurnWeek).toFixed(0)}%</span>
          </div>
        </div>

        {/* Study Card */}
        <div className="dashboard-card" onClick={() => window.location.href="/study"}>
          <div className="card-header">
            <h3>Study</h3>
            <span className="card-icon">📚</span>
          </div>
          <p>Hours Focused This Week</p>
          <div className="stat-value">
            {studyHours.toFixed(1)}
            <small className="stat-unit"> hrs</small>
          </div>

          <div className="streak-badge" title={`Longest streak: ${longestStreak} days`}>
            🔥 {currentStreak} day streak
          </div>

          <div className="stat-subtext">{getStreakMessage(currentStreak)}</div>

          <div className="progress-bar">
            <div
              className="progress-fill study"
              style={{ width: `${calculateProgress(studyHours, goals.studyHoursWeek)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            <span>Goal: 20 hours</span>
            <span>{calculateProgress(studyHours, goals.studyHoursWeek).toFixed(0)}%</span>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div className="stat-subtext">
              Tasks: {pendingTasksCount} pending • {completedTasksCount} completed
            </div>
          </div>
        </div>

        {/* Wellness Card */}
        <div className="dashboard-card" onClick={() => window.location.href="/stress"}>
          <div className="card-header">
            <h3>Wellness</h3>
            <span className="card-icon">🧘</span>
          </div>
          <p>Average Mood (7 days)</p>
          <div className="stat-value">
            {getMoodEmoji(avgMood10)}
            <span style={{ marginLeft: '0.5rem', fontSize: '2rem' }}>{avgMood10.toFixed(1)}/10</span>
          </div>
          <div className="mood-text">{getMoodText(avgMood10)}</div>
          <div className="focus-sessions">
            <span className="focus-label">Wellness Sessions:</span>
            <span className="focus-count">{focusSessions}</span>
          </div>

          {moodRecent.length > 0 && (
            <div className="stat-subtext" style={{ marginTop: '0.5rem' }}>
              Latest check-in: {moodToTen(moodRecent[0].mood_score).toFixed(0)}/10
              {moodRecent[0].notes ? ` • “${moodRecent[0].notes.slice(0, 40)}${moodRecent[0].notes.length > 40 ? '…' : ''}”` : ''}
            </div>
          )}
        </div>

        {/* Water Card */}
        <div className="dashboard-card" onClick={() => window.location.href="/hydration"}>
          <div className="card-header">
            <h3>Hydration</h3>
            <span className="card-icon">💧</span>
          </div>
          <p>Daily Average (7 days)</p>
          <div className="stat-value">
            {waterAvg.toFixed(1)}
            <small className="stat-unit"> glasses</small>
          </div>

          <div className="stat-subtext" style={{ marginBottom: '0.5rem' }}>
            Today: <strong>{waterToday}</strong> / {goals.waterPerDay} glasses
          </div>

          <div className="water-cups">
            {[...Array(goals.waterPerDay)].map((_, i) => (
              <div key={i} className={`water-cup ${i < Math.floor(waterToday) ? 'filled' : ''}`}>
                💧
              </div>
            ))}
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill water"
              style={{ width: `${calculateProgress(waterToday, goals.waterPerDay)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            <span>Goal: {goals.waterPerDay} glasses</span>
            <span>{calculateProgress(waterToday, goals.waterPerDay).toFixed(0)}%</span>
          </div>

          {waterWeek.length > 0 && (
            <div className="stat-subtext" style={{ marginTop: '0.5rem' }}>
              Last 7 days logged: {waterWeek.reduce((acc, x) => acc + (x.glasses || 0), 0)} glasses
            </div>
          )}
        </div>

        {/* Recent Activity - Full Width */}
        <div className="dashboard-card tasks-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button
              className="refresh-button"
              onClick={() => fetchAllDashboardData(true)}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              {refreshing ? '…' : '↻ Refresh'}
            </button>
          </div>

          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="activity-item">
                <div className="activity-icon">✨</div>
                <div className="activity-content">
                  <span className="activity-title">No recent activity yet</span>
                  <span className="activity-time">Start a study, workout, focus session, or log mood/water.</span>
                </div>
              </div>
            ) : (
              recentActivity.map((a) => (
                <div className="activity-item" key={a.key}>
                  <div className="activity-icon">{a.icon}</div>
                  <div className="activity-content">
                    <span className="activity-title">{a.title}</span>
                    <span className="activity-time">{a.timeLabel}</span>
                  </div>
                  {a.rightLabel ? (
                    <div className={`activity-calories ${a.rightClassName ?? ''}`.trim()}>
                      {a.rightLabel}
                    </div>
                  ) : (
                    <div className="activity-calories"> </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Small “extras” that prove we’re using more endpoints */}
          <div style={{ marginTop: '1rem' }}>
            <div className="stat-subtext">
              Gratitude entries (7 days): {gratitudeRecent.length} • Journal entries: {journalRecent.length}
            </div>
            <div className="stat-subtext">
              Latest focus sessions loaded: {focusHistory.length} • Latest workouts loaded: {workoutHistory.length} • Latest study sessions loaded: {studyHistory.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
