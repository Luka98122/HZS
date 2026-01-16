// Stress.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Stress.css';

type ApiError = { message?: string } | string;

type MoodEntry = {
  id?: string;
  mood_score: number; // 1-5
  notes?: string | null;
  created_at?: string;
  date?: string;
};

type JournalEntry = {
  id: string;
  entry_text: string;
  created_at?: string;
};

type WeeklyMoodAverage = {
  average: number; // backend may return {average} or {avg}
  avg?: number;
};

type FocusSession = {
  id?: string;
  session_type: string;
  duration: number;
  breathing_pattern?: string | null;
  ambient_sound?: string | null;
  created_at?: string;
};

type RecentJournalResponse = {
  entries: JournalEntry[];
};

const API_BASE = 'https://hak.hoi5.com/api';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    credentials: 'include', // IMPORTANT: session cookie
  });

  if (!res.ok) {
    let payload: ApiError = 'Request failed';
    try {
      payload = await res.json();
    } catch {
      try {
        payload = await res.text();
      } catch {
        // ignore
      }
    }
    const msg =
      typeof payload === 'string'
        ? payload
        : payload?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

type SoundscapeKind = 'rain' | 'forest' | 'white';
type RecentMoodsResponse = { moods: MoodEntry[] };
1
function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * seconds, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

const Stress: React.FC = () => {
  // UI panels
  const [activeTool, setActiveTool] = useState<'breathing' | 'journaling' | 'soundscapes' | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // Mood
  const [moodNotes, setMoodNotes] = useState('');
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [weeklyMoodAvg, setWeeklyMoodAvg] = useState<number | null>(null);

  // Journal
  const [journalText, setJournalText] = useState('');
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([]);

  // Breathing
  const inhaleSec = 4;
  const holdSec = 7;
  const exhaleSec = 8;
  const cycleTotal = inhaleSec + holdSec + exhaleSec;

  const [breathingRunning, setBreathingRunning] = useState(false);
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(cycleTotal);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCycleCount, setBreathingCycleCount] = useState(0);
  const breathingTimerRef = useRef<number | null>(null);
  const breathingStartedAtRef = useRef<number | null>(null);

  // Soundscapes (WebAudio)
  const [soundscape, setSoundscape] = useState<SoundscapeKind>('rain');
  const [soundPlaying, setSoundPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const extraNodeRef = useRef<BiquadFilterNode | OscillatorNode | null>(null);

  

  const patternLabel = useMemo(() => `4-7-8`, []);
  const breathingPatternString = useMemo(() => `4-7-8 (${inhaleSec}-${holdSec}-${exhaleSec})`, [inhaleSec, holdSec, exhaleSec]);

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshMood = useCallback(async () => {
    const [recentRes, avgRaw] = await Promise.all([
      apiFetch<RecentMoodsResponse>('/mood/recent'),
      apiFetch<WeeklyMoodAverage>('/mood/average'),
    ]);

    setRecentMoods(Array.isArray(recentRes?.moods) ? recentRes.moods : []);

    const avg =
      typeof avgRaw?.average === 'number'
        ? avgRaw.average
        : typeof avgRaw?.avg === 'number'
          ? avgRaw.avg
          : null;

    setWeeklyMoodAvg(avg);
  }, []);

  const refreshJournal = useCallback(async () => {
    const res = await apiFetch<RecentJournalResponse>('/journal/recent');
    setRecentJournals(Array.isArray(res?.entries) ? res.entries : []);
  }, []);

  useEffect(() => {
    // Load initial data (if logged in, cookie will work; otherwise these may 401)
    (async () => {
      try {
        await Promise.allSettled([refreshMood(), refreshJournal()]);
      } catch {
        // ignore here; actions will surface errors
      }
    })();
  }, [refreshMood, refreshJournal]);

  // Breathing tick logic
  const computePhase = useCallback((tInCycle: number) => {
    // tInCycle: 0..cycleTotal-1 (integer seconds elapsed in current cycle)
    if (tInCycle < inhaleSec) return 'Inhale' as const;
    if (tInCycle < inhaleSec + holdSec) return 'Hold' as const;
    return 'Exhale' as const;
  }, [inhaleSec, holdSec]);

  const stopBreathing = useCallback(() => {
    setBreathingRunning(false);
    if (breathingTimerRef.current) {
      window.clearInterval(breathingTimerRef.current);
      breathingTimerRef.current = null;
    }
    breathingStartedAtRef.current = null;
    setBreathingSecondsLeft(cycleTotal);
    setBreathingPhase('Inhale');
    setBreathingCycleCount(0);
  }, [cycleTotal]);

  const startBreathing = useCallback(async () => {
    try {
      setLoading(true);
      await apiFetch<FocusSession>('/focus/session', {
        method: 'POST',
        body: JSON.stringify({
          session_type: 'breathing',
          duration: 60, 
          breathing_pattern: breathingPatternString,
        }),
      });
      showToast('success', 'Breathing session started.');
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to start breathing session.');
    } finally {
      setLoading(false);
    }

    setBreathingRunning(true);
    setBreathingCycleCount(0);
    setBreathingSecondsLeft(cycleTotal);
    setBreathingPhase('Inhale');
    breathingStartedAtRef.current = Date.now();

    if (breathingTimerRef.current) window.clearInterval(breathingTimerRef.current);

    breathingTimerRef.current = window.setInterval(() => {
      const startedAt = breathingStartedAtRef.current;
      if (!startedAt) return;

      const elapsedMs = Date.now() - startedAt;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const tInCycle = elapsedSec % cycleTotal;

      const phase = computePhase(tInCycle);
      setBreathingPhase(phase);

      const secondsLeft = cycleTotal - (tInCycle + 1);
      setBreathingSecondsLeft(secondsLeft >= 0 ? secondsLeft : 0);

      // increment cycle count at cycle boundary
      if (tInCycle === cycleTotal - 1) {
        setBreathingCycleCount((c) => c + 1);
      }
    }, 250);
  }, [breathingPatternString, computePhase, cycleTotal, showToast]);

  useEffect(() => {
    return () => {
      // cleanup timers + audio on unmount
      if (breathingTimerRef.current) window.clearInterval(breathingTimerRef.current);
      breathingTimerRef.current = null;
      try {
        if (sourceRef.current) sourceRef.current.stop();
      } catch {
        // ignore
      }
      sourceRef.current = null;
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => undefined);
      }
      audioCtxRef.current = null;
    };
  }, []);

  // Soundscape controls
  const stopSound = useCallback(() => {
    setSoundPlaying(false);
    try {
      if (sourceRef.current) sourceRef.current.stop();
    } catch {
      // ignore
    }
    sourceRef.current = null;
    extraNodeRef.current = null;
    // keep context alive (faster restart), but mute
    if (gainRef.current) gainRef.current.gain.value = 0;
  }, []);

  const startSound = useCallback(async (kind: SoundscapeKind) => {
    // Log focus session as “soundscape”
    try {
      setLoading(true);
      await apiFetch<FocusSession>('/focus/session', {
        method: 'POST',
        body: JSON.stringify({
          session_type: 'ambient',
          duration: 300, // 5 minutes planned
          ambient_sound: kind,
        }),
      });
      showToast('success', 'Soundscape started.');
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to start soundscape session.');
      // still allow local playback
    } finally {
      setLoading(false);
    }

    // Create/Resume audio
    const AudioContextCtor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!AudioContextCtor) {
      showToast('error', 'Web Audio is not supported in this browser.');
      return;
    }

    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextCtor();
    const ctx = audioCtxRef.current;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }

    // Stop any existing nodes
    stopSound();

    const noiseBuffer = createNoiseBuffer(ctx, 2);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.0;

    // Route chain differs by kind
    if (kind === 'white') {
      src.connect(gain).connect(ctx.destination);
    } else if (kind === 'rain') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.7;

      // subtle amplitude modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.25; // slow
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.18;
      lfo.connect(lfoGain).connect(gain.gain);

      src.connect(filter).connect(gain).connect(ctx.destination);
      lfo.start();

      extraNodeRef.current = lfo;
    } else {
      // forest: lowpass + random “gust” modulation
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;

      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.14;
      lfo.connect(lfoGain).connect(gain.gain);

      src.connect(filter).connect(gain).connect(ctx.destination);
      lfo.start();

      extraNodeRef.current = lfo;
    }

    sourceRef.current = src;
    gainRef.current = gain;

    src.start();
    // fade in
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.8);

    setSoundPlaying(true);
  }, [showToast, stopSound]);

  // Actions
  const handleMoodClick = useCallback(async (score: number) => {
    try {
      setLoading(true);
      await apiFetch<MoodEntry>('/mood', {
        method: 'POST',
        body: JSON.stringify({
          mood_score: score,
          notes: moodNotes.trim() ? moodNotes.trim() : undefined,
        }),
      });
      setMoodNotes('');
      showToast('success', 'Mood saved.');
      await refreshMood();
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to save mood.');
    } finally {
      setLoading(false);
    }
  }, [moodNotes, refreshMood, showToast]);

  const submitJournal = useCallback(async () => {
    const text = journalText.trim();
    if (!text) {
      showToast('error', 'Write something first.');
      return;
    }
    try {
      setLoading(true);
      await apiFetch<JournalEntry>('/journal', {
        method: 'POST',
        body: JSON.stringify({ entry_text: text }),
      });
      setJournalText('');
      showToast('success', 'Journal entry saved.');
      await refreshJournal();
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to save journal entry.');
    } finally {
      setLoading(false);
    }
  }, [journalText, refreshJournal, showToast]);

  const moodEmoji = useMemo(() => {
    const map = new Map<number, string>([
      [1, '😫'],
      [2, '😕'],
      [3, '😐'],
      [4, '🙂'],
      [5, '🤩'],
    ]);
    return map;
  }, []);

  const toolSubtitle = useMemo(() => {
    if (activeTool === 'breathing') return 'Guided 4-7-8 breathing with a live timer.';
    if (activeTool === 'journaling') return 'Write it out. Save entries to your account.';
    if (activeTool === 'soundscapes') return 'Calming ambient audio generated in-browser.';
    return 'Pick a tool to begin.';
  }, [activeTool]);

  const breathingPhaseHint = useMemo(() => {
    if (breathingPhase === 'Inhale') return `Inhale for ${inhaleSec}s`;
    if (breathingPhase === 'Hold') return `Hold for ${holdSec}s`;
    return `Exhale for ${exhaleSec}s`;
  }, [breathingPhase, inhaleSec, holdSec, exhaleSec]);

  const openTool = useCallback((tool: 'breathing' | 'journaling' | 'soundscapes') => {
    setActiveTool((cur) => (cur === tool ? null : tool));
  }, []);

  return (
    <div className="stress-container">
      <div className="container">
        <div className="stress-header">
          <h1>Stress Management</h1>
          <p className="stress-subtitle">Take a moment to center yourself and decompress.</p>

          <div className="status-row" aria-live="polite">
            {loading ? <span className="pill pill-muted">Working…</span> : <span className="pill pill-muted">Ready</span>}
            {weeklyMoodAvg !== null && (
              <span className="pill pill-info">
                Weekly mood avg: <strong>{weeklyMoodAvg.toFixed(2)}</strong>
              </span>
            )}
            <span className="pill pill-muted">{toolSubtitle}</span>
          </div>

          {toast && (
            <div className={`toast ${toast.kind === 'success' ? 'toast-success' : 'toast-error'}`}>
              {toast.text}
            </div>
          )}
        </div>

        <div className="stress-tools">
          <button
            type="button"
            className={`tool-card ${activeTool === 'breathing' ? 'tool-card-active' : ''}`}
            onClick={() => openTool('breathing')}
          >
            <div className="tool-icon" aria-hidden="true">🌬️</div>
            <h3>Breathing</h3>
            <p>Guided 4-7-8 breathing technique to reduce anxiety instantly.</p>
            <div className="tool-cta">
              {activeTool === 'breathing' ? 'Close' : 'Open'}
            </div>
          </button>

          <button
            type="button"
            className={`tool-card ${activeTool === 'journaling' ? 'tool-card-active' : ''}`}
            onClick={() => openTool('journaling')}
          >
            <div className="tool-icon" aria-hidden="true">📝</div>
            <h3>Journaling</h3>
            <p>Write down your thoughts to clear your mind and gain perspective.</p>
            <div className="tool-cta">
              {activeTool === 'journaling' ? 'Close' : 'Open'}
            </div>
          </button>

          <button
            type="button"
            className={`tool-card ${activeTool === 'soundscapes' ? 'tool-card-active' : ''}`}
            onClick={() => openTool('soundscapes')}
          >
            <div className="tool-icon" aria-hidden="true">🎧</div>
            <h3>Soundscapes</h3>
            <p>Listen to calming rain, forest sounds, or white noise.</p>
            <div className="tool-cta">
              {activeTool === 'soundscapes' ? 'Close' : 'Open'}
            </div>
          </button>
        </div>

        {/* Tool panel */}
        {activeTool && (
          <div className="tool-panel">
            {activeTool === 'breathing' && (
              <div className="panel-inner">
                <div className="panel-header">
                  <h2>4-7-8 Breathing</h2>
                  <div className="panel-meta">
                    <span className="pill pill-muted">Pattern: {patternLabel}</span>
                    <span className="pill pill-muted">Cycles: {breathingCycleCount}</span>
                  </div>
                </div>

                <div className="breathing-display">
                  <div className={`breathing-orb phase-${breathingPhase.toLowerCase()}`}>
                    <div className="breathing-phase">{breathingPhase}</div>
                    <div className="breathing-hint">{breathingPhaseHint}</div>
                    <div className="breathing-timer">
                      {breathingSecondsLeft}s
                      <span className="breathing-timer-sub">left in cycle</span>
                    </div>
                  </div>

                  <div className="breathing-controls">
                    {!breathingRunning ? (
                      <button type="button" className="primary-btn" onClick={startBreathing}>
                        Start
                      </button>
                    ) : (
                      <button type="button" className="danger-btn" onClick={stopBreathing}>
                        Stop
                      </button>
                    )}
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        // quick “reset”
                        stopBreathing();
                        showToast('success', 'Reset.');
                      }}
                      disabled={breathingRunning}
                      title={breathingRunning ? 'Stop first to reset' : 'Reset breathing UI'}
                    >
                      Reset
                    </button>
                  </div>

                  <div className="panel-note">
                    Tip: Relax your shoulders. Breathe silently through your nose on inhale, and slowly through your mouth on exhale.
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'journaling' && (
              <div className="panel-inner">
                <div className="panel-header">
                  <h2>Stress Journal</h2>
                  <div className="panel-meta">
                    <span className="pill pill-muted">Saved to: /journal</span>
                  </div>
                </div>

                <div className="journal-grid">
                  <div className="journal-compose">
                    <label className="field-label" htmlFor="journalText">What’s on your mind?</label>
                    <textarea
                      id="journalText"
                      className="textarea"
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Write freely. You can also note triggers, body sensations, or what you need right now…"
                      rows={7}
                    />
                    <div className="row">
                      <button type="button" className="primary-btn" onClick={submitJournal}>
                        Save entry
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={async () => {
                          try {
                            setLoading(true);
                            await refreshJournal();
                            showToast('success', 'Journal refreshed.');
                          } catch (e: any) {
                            showToast('error', e?.message || 'Failed to refresh.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="journal-recent">
                    <h3 className="section-title">Recent entries</h3>
                    {recentJournals.length === 0 ? (
                      <div className="empty-state">No journal entries yet.</div>
                    ) : (
                      <ul className="entry-list">
                        {recentJournals.map((j) => (
                          <li key={j.id} className="entry-item">
                            <div className="entry-text">{j.entry_text}</div>
                            <div className="entry-meta">
                              <span className="pill pill-muted">ID: {j.id}</span>
                              {j.created_at && <span className="pill pill-muted">{new Date(j.created_at).toLocaleString()}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'soundscapes' && (
              <div className="panel-inner">
                <div className="panel-header">
                  <h2>Soundscapes</h2>
                  <div className="panel-meta">
                    <span className="pill pill-muted">Generated in browser</span>
                    {soundPlaying ? <span className="pill pill-info">Playing</span> : <span className="pill pill-muted">Stopped</span>}
                  </div>
                </div>

                <div className="soundscape-controls">
                  <div className="soundscape-picker">
                    <div className="field-label">Choose a sound</div>
                    <div className="segmented">
                      <button
                        type="button"
                        className={`seg-btn ${soundscape === 'rain' ? 'seg-active' : ''}`}
                        onClick={() => setSoundscape('rain')}
                      >
                        Rain
                      </button>
                      <button
                        type="button"
                        className={`seg-btn ${soundscape === 'forest' ? 'seg-active' : ''}`}
                        onClick={() => setSoundscape('forest')}
                      >
                        Forest
                      </button>
                      <button
                        type="button"
                        className={`seg-btn ${soundscape === 'white' ? 'seg-active' : ''}`}
                        onClick={() => setSoundscape('white')}
                      >
                        White noise
                      </button>
                    </div>
                  </div>

                  <div className="soundscape-actions">
                    {!soundPlaying ? (
                      <button type="button" className="primary-btn" onClick={() => startSound(soundscape)}>
                        Play
                      </button>
                    ) : (
                      <button type="button" className="danger-btn" onClick={stopSound}>
                        Stop
                      </button>
                    )}
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          // logs a quick “focus session” without audio change
                          await apiFetch<FocusSession>('/focus/session', {
                            method: 'POST',
                            body: JSON.stringify({
                              session_type: 'ambient',
                              duration: 300,
                              ambient_sound: soundscape,
                            }),
                          });
                          showToast('success', 'Logged soundscape session.');
                        } catch (e: any) {
                          showToast('error', e?.message || 'Failed to log soundscape.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      title="Log a soundscape focus session"
                    >
                      Log session
                    </button>
                  </div>

                  <div className="panel-note">
                    Tip: Pair a soundscape with a 5-minute breathing cycle for a fast reset.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mood tracker */}
        <div className="mood-tracker">
          <h3>How are you feeling right now?</h3>

          <div className="mood-notes">
            <input
              className="input"
              value={moodNotes}
              onChange={(e) => setMoodNotes(e.target.value)}
              placeholder="Optional notes (e.g., what's causing stress?)"
            />
          </div>

          <div className="mood-options" role="group" aria-label="Mood score">
            <button className="mood-btn" onClick={() => handleMoodClick(1)} aria-label="Mood 1">
              😫
            </button>
            <button className="mood-btn" onClick={() => handleMoodClick(2)} aria-label="Mood 2">
              😕
            </button>
            <button className="mood-btn" onClick={() => handleMoodClick(3)} aria-label="Mood 3">
              😐
            </button>
            <button className="mood-btn" onClick={() => handleMoodClick(4)} aria-label="Mood 4">
              🙂
            </button>
            <button className="mood-btn" onClick={() => handleMoodClick(5)} aria-label="Mood 5">
              🤩
            </button>
          </div>

          <div className="mood-recent">
            <div className="mood-recent-header">
              <h4>Recent check-ins</h4>
              <button
                type="button"
                className="mini-btn"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await refreshMood();
                    showToast('success', 'Mood refreshed.');
                  } catch (e: any) {
                    showToast('error', e?.message || 'Failed to refresh mood.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Refresh
              </button>
            </div>

            {recentMoods.length === 0 ? (
              <div className="empty-state">No mood check-ins yet.</div>
            ) : (
              <ul className="mood-list">
                {recentMoods.slice(0, 14).map((m, idx) => (
                  <li key={m.id ?? `${m.created_at ?? 'm'}-${idx}`} className="mood-item">
                    <span className="mood-emoji">{moodEmoji.get(m.mood_score) ?? '🙂'}</span>
                    <span className="mood-score">Score {m.mood_score}</span>
                    {(m.created_at || m.date) && (
                      <span className="mood-time">
                        {new Date(m.created_at ?? m.date ?? Date.now()).toLocaleString()}
                      </span>
                    )}
                    {m.notes && <span className="mood-notes-inline">“{m.notes}”</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Stress;
