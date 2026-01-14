import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Focus.css';

interface FocusSessionData {
  session_type: 'breathing' | 'meditation' | 'ambient';
  duration: number;
  breathing_pattern?: string | null;
  ambient_sound?: string | null;
}

interface FocusSessionResponse {
  message: string;
  session: {
    id: number;
    session_type: string;
    duration: number;
    completed_at: string;
  };
}

const Focus: React.FC = () => {
  const [message, setMessage] = useState("Breathe In...");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [showCheckin, setShowCheckin] = useState(false);
  const [totalSessionTime, setTotalSessionTime] = useState(0); // Track total time spent
  const navigate = useNavigate();

  // Breathing animation timer
  useEffect(() => {
    if (showCheckin) return;

    const interval = setInterval(() => {
      setMessage(prev => prev === "Breathe In..." ? "Breathe Out..." : "Breathe In...");
    }, 4000);
    return () => clearInterval(interval);
  }, [showCheckin]);

  // Session countdown timer
  useEffect(() => {
    if (showCheckin) return;

    if (timeLeft <= 0) {
      setShowCheckin(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // Track total time spent
        if (prev > 0) {
          setTotalSessionTime(prevTime => prevTime + 1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showCheckin]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create focus session in backend
  const createFocusSession = async (): Promise<FocusSessionResponse | null> => {
    try {
      const sessionData: FocusSessionData = {
        session_type: 'breathing',
        duration: 300, // 5 minutes in seconds
        breathing_pattern: '4-7-8', // Standard breathing pattern
        ambient_sound: null
      };

      const response = await fetch('/api/focus/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FocusSessionResponse = await response.json();
      console.log('Focus session created:', data);
      return data;
    } catch (error) {
      console.error('Error creating focus session:', error);
      return null;
    }
  };

  // Get focus history from backend
  const getFocusHistory = async () => {
    try {
      const response = await fetch('/api/focus/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Focus history:', data);
      return data.sessions;
    } catch (error) {
      console.error('Error fetching focus history:', error);
      return [];
    }
  };

  // Create gratitude entry in backend
  const createGratitudeEntry = async (entryText: string): Promise<any> => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const response = await fetch('/api/gratitude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          entry_text: entryText,
          date: today
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gratitude entry created:', data);
      return data;
    } catch (error) {
      console.error('Error creating gratitude entry:', error);
      return null;
    }
  };

  // Get recent gratitude entries from backend
  const getRecentGratitude = async () => {
    try {
      const response = await fetch('/api/gratitude/recent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Recent gratitude entries:', data);
      return data.entries;
    } catch (error) {
      console.error('Error fetching gratitude entries:', error);
      return [];
    }
  };

  const handleYes = async () => {
    try {
      // Create focus session before navigating
      const sessionResult = await createFocusSession();
      
      // Optional: You could also create a gratitude entry here
      // For example, asking the user what they're grateful for today
      // await createGratitudeEntry("I'm grateful for taking time to focus and breathe.");
      
      // Get history (optional - could be for analytics)
      await getFocusHistory();
      
      navigate('/home');
    } catch (error) {
      console.error('Error in handleYes:', error);
      // Still navigate even if API fails
      navigate('/home');
    }
  };

  const handleMoreTime = () => {
    // If user wants more time, we could create a session for the completed time
    // and start a new session
    const completedTime = 300 - timeLeft;
    if (completedTime > 0) {
      // Optionally create a session for the completed time
      createFocusSession().catch(console.error);
    }
    
    setTimeLeft(300);
    setShowCheckin(false);
  };

  const handleExit = async () => {
    // If user exits early, we could still record a session with the time spent
    const actualTimeSpent = 300 - timeLeft;
    if (actualTimeSpent > 30) { // Only record if they spent at least 30 seconds
      try {
        const sessionData: FocusSessionData = {
          session_type: 'breathing',
          duration: actualTimeSpent,
          breathing_pattern: '4-7-8',
          ambient_sound: null
        };

        await fetch('/api/focus/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(sessionData),
        });
      } catch (error) {
        console.error('Error recording partial session:', error);
      }
    }
    navigate('/home');
  };

  // Load focus history when component mounts (optional)
  useEffect(() => {
    // Uncomment if you want to load history on mount
    // getFocusHistory();
    // getRecentGratitude();
  }, []);

  return (
    <div className="focus-container">
      <div className="focus-timer" style={{
        position: 'absolute',
        top: '2rem',
        fontSize: '1.5rem',
        opacity: 0.8,
        fontFamily: 'monospace'
      }}>
        {formatTime(timeLeft)}
      </div>

      <div className={`focus-content ${showCheckin ? 'blurred' : ''}`}>
        <div className="focus-circle">
          <span style={{ fontSize: '3rem' }}>🧘</span>
        </div>
        <div className="focus-message">{message}</div>
      </div>

      {showCheckin && (
        <div className="checkin-modal" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(30, 30, 30, 0.95)',
          padding: '2rem',
          borderRadius: '1rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 10,
          minWidth: '300px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Do you feel better?</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleYes}
            >
              Yes
            </button>
            <button
              onClick={handleMoreTime}
            >
              No, I need more time
            </button>
          </div>
        </div>
      )}

      {!showCheckin && (
        <button 
          className="btn btn-secondary" 
          style={{
            position: 'absolute',
            bottom: '2rem',
            opacity: 0.5
          }} 
          onClick={handleExit}
        >
          Exit Focus Mode
        </button>
      )}
    </div>
  );
};

export default Focus;