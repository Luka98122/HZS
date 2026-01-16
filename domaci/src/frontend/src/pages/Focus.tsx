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
  const [timeLeft, setTimeLeft] = useState(300); 
  const [showCheckin, setShowCheckin] = useState(false);
  const [totalSessionTime, setTotalSessionTime] = useState(0); 
  const navigate = useNavigate();

  useEffect(() => {
    if (showCheckin) return;

    const interval = setInterval(() => {
      setMessage(prev => prev === "Breathe In..." ? "Breathe Out..." : "Breathe In...");
    }, 4000);
    return () => clearInterval(interval);
  }, [showCheckin]);

  useEffect(() => {
    if (showCheckin) return;

    if (timeLeft <= 0) {
      setShowCheckin(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {

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

  const createFocusSession = async (): Promise<FocusSessionResponse | null> => {
    try {
      const sessionData: FocusSessionData = {
        session_type: 'breathing',
        duration: 300, 
        breathing_pattern: '4-7-8', 
        ambient_sound: null
      };

      const response = await fetch('/api/focus/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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



  const handleYes = async () => {
    try {
      const sessionResult = await createFocusSession();

      await getFocusHistory();
      
      navigate('/home');
    } catch (error) {
      console.error('Error in handleYes:', error);
      navigate('/home');
    }
  };

  const handleMoreTime = () => {
    const completedTime = 300 - timeLeft;
    if (completedTime > 0) {

      createFocusSession().catch(console.error);
    }
    
    setTimeLeft(300);
    setShowCheckin(false);
  };

  const handleExit = async () => {
    const actualTimeSpent = 300 - timeLeft;
    if (actualTimeSpent > 30) { 
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