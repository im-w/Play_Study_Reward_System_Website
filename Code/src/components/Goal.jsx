import React, { useState, useEffect } from 'react';
import { getItem, setItem } from '../utils/indexedDB';
import './Goal.css';

const LABELS = [
  '🔭 5-Year Vision & Legacy',
  '🚀 1-Year Growth & Milestones',
  '🔥 3-Month Focus & Progress',
  '⚡ 1-Month Push & Habits', 
  '📅 1-Week Plan & Tasks',
  '⏰ 1-Day Priorities & Wins' 
];

const LOCAL_KEY = 'app:goals';

const Goal = () => {
  const [values, setValues] = useState(() => Array(LABELS.length).fill(''));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await getItem(LOCAL_KEY);
        if (Array.isArray(data) && data.length === LABELS.length) {
          setValues(data);
        }
      } catch (err) {
        console.error('Error loading goals from IndexedDB', err);
      } finally {
        setLoading(false);
      }
    }
    loadGoals();
  }, []);

  const updateValue = (index, val) => {
    setValues(prev => {
      const next = [...prev];
      next[index] = val;
      setItem(LOCAL_KEY, next).catch(err => {
        console.error('Error saving goals to IndexedDB', err);
      });
      return next;
    });
  };

  if (loading) return <div className="goal-loading">Loading goals...</div>;

  return (
    <div className="glass-card goal-card">
      <div className="goal-header">
        <span className="goal-title">Goals</span>
      </div>
      <div className="goal-inputs">
        {LABELS.map((label, i) => (
          <input
            key={label}
            type="text"
            className="goal-input"
            placeholder={label}
            value={values[i]}
            onChange={(e) => updateValue(i, e.target.value)}
            aria-label={`goal-${label}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Goal;
