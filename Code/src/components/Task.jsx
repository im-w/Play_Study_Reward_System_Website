import React from 'react';
import './Task.css';

const ArrowIcon = ({ up = true }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false">
    {up ? <path d="M7 14l5-5 5 5H7z" fill="currentColor" /> : <path d="M7 10l5 5 5-5H7z" fill="currentColor" />}
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 1H8l1-1z" fill="currentColor" />
  </svg>
);

const Task = ({ task, onComplete, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  if (!task) return null;
  const { id, name, category, difficulty, completed, rewarded } = task;

  const difficultyClass =
    difficulty === 'easy' ? 'chip-diff easy' :
    difficulty === 'medium' ? 'chip-diff medium' :
    'chip-diff hard';

  return (
    <div
      className={`task-item ${completed ? 'task-completed' : ''}`}
      role="listitem"
      aria-labelledby={`task-title-${id}`}
    >
      <label className="task-left">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={!!completed}
          onChange={() => onComplete(id)}
          aria-checked={!!completed}
        />
        <div className="task-texts">
          <div id={`task-title-${id}`} className="task-name">
            {name}
          </div>

          <div className="task-meta">
            <span className="chip chip-cat">{category}</span>
            <span className={`chip ${difficultyClass}`}>{difficulty}</span>
            {rewarded && <span className="chip chip-reward">Rewarded</span>}
          </div>
        </div>
      </label>

      <div className="task-actions">
        <button
          className="icon-btn"
          onClick={() => onMoveUp(id)}
          disabled={isFirst}
          aria-disabled={isFirst}
          title="Move up"
        >
          <ArrowIcon up />
        </button>

        <button
          className="icon-btn"
          onClick={() => onMoveDown(id)}
          disabled={isLast}
          aria-disabled={isLast}
          title="Move down"
        >
          <ArrowIcon up={false} />
        </button>

        <button
          className="icon-btn danger"
          onClick={() => onDelete(id)}
          title="Delete"
          aria-label={`delete-${name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default Task;
