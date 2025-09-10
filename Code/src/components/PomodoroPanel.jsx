import React from 'react';
import Pomodoro from './Pomodoro';
import './PomodoroPanel.css';

const formatHours = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} hr ${m} min`;
};

const PomodoroPanel = ({ totalStudyMinutes, studyGoalMinutes, setStudyGoalMinutes, onStudyComplete }) => {
  const progress = studyGoalMinutes > 0 ? Math.min((totalStudyMinutes / studyGoalMinutes) * 100, 100) : 0;

  return (
    <div className="glass-card pomodoro-panel">
      <div className="panel-top">
        <div className="panel-time">{formatHours(totalStudyMinutes)}</div>

        <div className="panel-progress-wrap" aria-hidden>
          <div className="panel-progress-track">
            <div
              className="panel-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="panel-inputs">
          <label className="panel-input-label">
            <span className="panel-input-title">Goal (minutes) 🎯</span>
            <input
              className="panel-number-input no-spinner"
              type="text"
              value={studyGoalMinutes}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                const v = Number(onlyNums);
                setStudyGoalMinutes(Number.isFinite(v) ? v : 0);
              }}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== 'Backspace' &&
                  e.key !== 'ArrowLeft' &&
                  e.key !== 'ArrowRight' &&
                  e.key !== 'Delete' &&
                  e.key !== 'Tab'
                ) {
                  e.preventDefault();
                }
              }}
              aria-label="study-goal-minutes"
            />
          </label>
        </div>
      </div>

      <div className="panel-timer">
        <Pomodoro onStudyComplete={onStudyComplete} />
      </div>
    </div>
  );
};

export default PomodoroPanel;
