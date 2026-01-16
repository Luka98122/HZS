// Study.tsx
import React, { useState, useEffect, useRef } from 'react';
import './Study.css';

// Removed unused StudySession interface

interface StudyTask {
  id: number;
  task_name: string;
  estimated_time: number;
  actual_time: number | null;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
}

const API_BASE_URL = 'https://hak.hoi5.com/api';

const Study: React.FC = () => {
  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  
  // Task states
  const [tasks, setTasks] = useState<{
    pending: StudyTask[];
    completed: StudyTask[];
  }>({ pending: [], completed: [] });
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [newTaskTime, setNewTaskTime] = useState<number>(25);
  
  // Stats states
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [streak, setStreak] = useState<StudyStreak>({
    current_streak: 0,
    longest_streak: 0,
    last_study_date: null
  });
  
  const timerRef = useRef<number | null>(null); // Changed from NodeJS.Timeout to number

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
    fetchStreak();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startStudySession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/study/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start study session');
      }

      const data = await response.json();
      setActiveSessionId(data.session_id);
      setIsRunning(true);
      setTimeLeft(isBreak ? 5 * 60 : 25 * 60); // Reset timer
    } catch (error) {
      console.error('Error starting study session:', error);
      alert('Failed to start study session. Please check your login.');
    }
  };

  const logDistraction = async () => {
    if (!activeSessionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/study/${activeSessionId}/distraction`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDistractionCount(data.distraction_count);
      }
    } catch (error) {
      console.error('Error logging distraction:', error);
    }
  };

  const logPomodoro = async () => {
    if (!activeSessionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/study/${activeSessionId}/pomodoro`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPomodoroCount(data.pomodoro_count);
      }
    } catch (error) {
      console.error('Error logging pomodoro:', error);
    }
  };

  const completeStudySession = async () => {
    if (!activeSessionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/study/${activeSessionId}/complete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const _data = await response.json(); // @ts-ignore
        setIsRunning(false);
        setActiveSessionId(null);
        setDistractionCount(0);
        setPomodoroCount(0);
        fetchStreak();
        
        // Switch to break or focus
        if (!isBreak) {
          setIsBreak(true);
          setTimeLeft(5 * 60); // 5 minute break
        } else {
          setIsBreak(false);
          setTimeLeft(25 * 60); // 25 minute focus
        }
      }
    } catch (error) {
      console.error('Error completing study session:', error);
    }
  };

  const handleTimerComplete = () => {
    if (isRunning && activeSessionId) {
      if (!isBreak) {
        logPomodoro();
      }
      completeStudySession();
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/study/tasks`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createTask = async () => {
    if (!newTaskName.trim()) {
      alert('Please enter a task name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/study/task`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_name: newTaskName,
          estimated_time: newTaskTime,
        }),
      });

      if (response.ok) {
        const _data = await response.json(); // @ts-ignore
        fetchTasks();
        setNewTaskName('');
        setNewTaskTime(25);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const updateTask = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/study/task/${taskId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/study/task/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/study/streak`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStreak(data);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const toggleTimer = () => {
    if (!activeSessionId && !isBreak) {
      startStudySession();
    } else if (activeSessionId) {
      setIsRunning(!isRunning);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const toggleBreak = () => {
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
    setIsRunning(false);
    if (activeSessionId) {
      completeStudySession();
    }
  };

  return (
    <div className="study-container container">
      <h1 className="section-title">Deep Work Session</h1>

      {/* Streak Display */}
      <div className="streak-display">
        <div className="streak-item">
          <span className="streak-label">Current Streak</span>
          <span className="streak-value">{streak.current_streak} days</span>
        </div>
        <div className="streak-item">
          <span className="streak-label">Longest Streak</span>
          <span className="streak-value">{streak.longest_streak} days</span>
        </div>
      </div>

      <div className="study-timer-section">
        <p style={{ letterSpacing: '0.2rem', textTransform: 'uppercase', color: '#007B5F' }}>
          {isBreak ? 'Break Timer' : 'Focus Timer'}
        </p>
        <div className="timer">{formatTime(timeLeft)}</div>
        <div className="study-controls">
          <button 
            className={`btn btn-large ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
            onClick={toggleTimer}
          >
            {isRunning
                ? 'Pause'
                : activeSessionId
                    ? 'Resume'
                    : isBreak
                    ? 'Start Break'
                    : 'Start Focus'}
          </button>
          <button 
            className="btn btn-large btn-secondary"
            onClick={toggleBreak}
          >
            {isBreak ? 'Switch to Focus' : 'Short Break'}
          </button>
        </div>
        
        {/* Session Controls */}
        {activeSessionId && (
          <div className="session-controls">
            <div className="session-stats">
              <span>Pomodoros: {pomodoroCount}</span>
              <span>Distractions: {distractionCount}</span>
            </div>
            <div className="session-buttons">
              <button 
                className="btn btn-sm btn-secondary"
                onClick={logDistraction}
              >
                Log Distraction
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={completeStudySession}
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Management */}
      <div className="task-management">
        <h2>Task Management</h2>
        <div className="task-input">
          <input
            type="text"
            placeholder="Task name"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="task-input-field"
          />
          <select
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(Number(e.target.value))}
            className="task-time-select"
          >
            <option value={15}>15 minutes</option>
            <option value={25}>25 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={createTask}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task Board */}
      <div className="task-board">
        <div className="task-column">
          <h3 style={{ marginBottom: '1rem', color: '#94a3b8' }}>Pending ({tasks.pending.length})</h3>
          {tasks.pending.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-content">
                <h4>{task.task_name}</h4>
                <p>Estimated: {task.estimated_time} minutes</p>
              </div>
              <div className="task-actions">
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => updateTask(task.id, true)}
                >
                  Complete
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="task-column">
          <h3 style={{ marginBottom: '1rem', color: '#34d399' }}>Completed ({tasks.completed.length})</h3>
          {tasks.completed.map((task) => (
            <div key={task.id} className="task-card completed">
              <div className="task-content">
                <h4>{task.task_name}</h4>
                <p>Estimated: {task.estimated_time} minutes</p>
                {task.actual_time && <p>Actual: {task.actual_time} minutes</p>}
              </div>
              <div className="task-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => updateTask(task.id, false)}
                >
                  Reopen
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Study;