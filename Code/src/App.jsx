import React, { useState } from 'react';
import './App.css';

import Profile from './components/Profile';
import SpiderChart from './components/SpiderChart';
import Goal from './components/Goal';
import PomodoroPanel from './components/PomodoroPanel';
import TaskList from './components/TaskList';
import CardList from './components/CardList';
import JournalPanel from './components/JournalPanel';

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function App() {
  const [profileName, setProfileName] = useState('');
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [studyGoalMinutes, setStudyGoalMinutes] = useState(600);
  const [coins, setCoins] = useState(0);

  const handleStudyComplete = (minutes) => {
    setTotalStudyMinutes((p) => p + minutes);
  };

  return (
    <div className="app-root">
      {/* Background decorative layers (optional) */}
      <div className="app-hero" aria-hidden="true" />

      {/* Left sidebar (40%) */}
      <aside className="left-col">
        <div className="left-inner">
          <div className="glass-card profile-panel">
            <div className="profile-header">
              <h3 className="profile-title">Profile</h3>
            </div>

            <div className="profile-body">
              <Profile name={profileName} setName={setProfileName} />
            </div>
          </div>

          <div className="glass-card spider-panel">
            <div className="panel-header">
              <h4 className="panel-title">Focus Overview</h4>
              <div className="panel-sub">work · mind · body</div>
            </div>
            <div className="panel-body">
              <SpiderChart />
            </div>
          </div>
        </div>
      </aside>

      {/* Right main area (60%) */}
      <main className="right-col">
        <div className="right-scroll">
          <div className="topbar">
            <div className="app-title">My Studio</div>
            <div className="topbar-actions">
              <div className="topbar-goal">
                <div className="small-muted">Study progress</div>
                <div className="progress-brief">
                  {Math.round((totalStudyMinutes / Math.max(1, studyGoalMinutes)) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <section className="section-card">
              <header className="section-header">
                <div className="section-title">Goals</div>
                <div className="section-actions small-muted">edit • save locally</div>
              </header>
              <div className="section-content">
                <Goal />
              </div>
            </section>

            <section className="section-card">
              <header className="section-header">
                <div className="section-title">Pomodoro</div>
                <div className="section-actions small-muted">auto-tracker</div>
              </header>
              <div className="section-content">
                <PomodoroPanel
                  totalStudyMinutes={totalStudyMinutes}
                  studyGoalMinutes={studyGoalMinutes}
                  setStudyGoalMinutes={setStudyGoalMinutes}
                  onStudyComplete={handleStudyComplete}
                />
              </div>
            </section>

            <section className="section-card">
              <header className="section-header">
                <div className="section-title">Tasks</div>
                <div className="section-actions small-muted">drag • reorder • reward</div>
              </header>
              <div className="section-content">
                <TaskList />
              </div>
            </section>

            <section className="section-card">
              <header className="section-header">
                <div className="section-title">Journal</div>
                <div className="section-actions small-muted">morning · night</div>
              </header>
              <div className="section-content">
                <JournalPanel profileName={profileName} />
              </div>
            </section>

            <div style={{ height: 48 }} /> {/* bottom padding so content isn't glued to the edge */}
          </div>
        </div>
      </main>
    </div>
  );
}
