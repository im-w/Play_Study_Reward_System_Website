import React, { useState, useEffect, useRef } from 'react';
import './Pomodoro.css';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Pomodoro = ({ onStudyComplete }) => {
  const [restMinutes, setRestMinutes] = useState(15);
  const [studyMinutes, setStudyMinutes] = useState(75);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => (15 + 75) * 60);
  const [soundOn, setSoundOn] = useState(true);
  const [notification, setNotification] = useState('');
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const completedRef = useRef(false);


  const prevTitleRef = useRef(document.title);

  const totalSeconds = (restMinutes + studyMinutes) * 60;
  const restSeconds = restMinutes * 60;


  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(totalSeconds);
      completedRef.current = false;
    }
  }, [restMinutes, studyMinutes, totalSeconds, isRunning]);


  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(''), 4000);
    return () => clearTimeout(t);
  }, [notification]);


  useEffect(() => {
    if (!isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {

          if (soundOn && audioRef.current) audioRef.current.play().catch(() => {});
          setNotification('درس و استراحت تمام شد!');
          if (onStudyComplete && !completedRef.current) {
            onStudyComplete(studyMinutes);
            completedRef.current = true;
          }
          setIsRunning(false);
          return 0;
        }

        const next = prev - 1;


        if (prev === (studyMinutes * 60 + 1)) {
          if (soundOn && audioRef.current) audioRef.current.play().catch(() => {});
          setNotification('استراحت تموم شد، حالا وقت درس است!');
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, soundOn, studyMinutes, restMinutes, onStudyComplete]);


  const restWidthPercent = totalSeconds > 0 ? (restSeconds / totalSeconds) * 100 : 0;
  const studyWidthPercent = totalSeconds > 0 ? ((studyMinutes * 60) / totalSeconds) * 100 : 0;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const elapsed = totalSeconds - timeLeft;

  const currentPhase = elapsed < restSeconds ? 'Break 🛋️' : 'Lesson 📚';

  const currentPhaseTimeLeft = (() => {
    if (elapsed < restSeconds) return restSeconds - elapsed;
    return totalSeconds - elapsed;
  })();

  const phaseLabel = elapsed < restSeconds ? 'Break 🛋️' : 'Lesson 📚';

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(currentPhaseTimeLeft)} | ${phaseLabel}`;
    } else {
      document.title = 'PLAY';
    }

    return () => {
      document.title = prevTitleRef.current || 'PLAY 🚀';
    };
  }, [isRunning, currentPhaseTimeLeft, phaseLabel]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (timeLeft === 0) {
      setTimeLeft(totalSeconds);
      completedRef.current = false;
    }
    setIsRunning(true);
  };

  return (
    <div className="glass-card pomodoro-card">
      <div className="pomodoro-body">
        <div className="pomodoro-left">
          <div
            className="pomodoro-timerbar"
            role="progressbar"
            aria-valuenow={Math.floor(progressPercent)}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="segment segment-rest" style={{ width: `${restWidthPercent}%` }} />
            <div className="segment segment-study" style={{ width: `${studyWidthPercent}%` }} />
            <div
              className={`progress-overlay ${isRunning ? 'running' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="phase-row">
            <span className="phase-name">{currentPhase}</span>
            <span className="phase-time">{formatTime(currentPhaseTimeLeft)}</span>
          </div>
        </div>

        <div className="pomodoro-right">
          <div className="range-row">
            <div className="range-label">Break (min) 🛋️</div>
            <input
              type="range"
              min="1"
              max="60"
              value={restMinutes}
              onChange={(e) => setRestMinutes(Number(e.target.value))}
              disabled={isRunning}
              aria-label="rest-minutes"
            />
            <div className="range-value">{restMinutes}</div>
          </div>

          <div className="range-row">
            <div className="range-label">Lesson (min) 📚</div>
            <input
              type="range"
              min="1"
              max="180"
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Number(e.target.value))}
              disabled={isRunning}
              aria-label="study-minutes"
            />
            <div className="range-value">{studyMinutes}</div>
          </div>

          <div className="buttons-row">
            <button className={`btn-simple ${isRunning ? 'running' : ''}`} onClick={handleStartStop}>
              {isRunning ? 'Surrender 🏳️' : 'Start Now ⚡'}
            </button>

            <button
              className="btn-toggle-sound"
              onClick={() => setSoundOn(s => !s)}
              title={soundOn ? 'Sound is ON 🔊' : 'Sound is OFF 🔇'}
              aria-pressed={soundOn}
            >
              {soundOn ? '🔔' : '🔕'}
            </button>
          </div>
        </div>
      </div>

      {notification && <div className="pomodoro-notification" role="status">{notification}</div>}

      <audio ref={audioRef} src="/sounds/alert.mp3" preload="auto" />
    </div>
  );
};

export default Pomodoro;
