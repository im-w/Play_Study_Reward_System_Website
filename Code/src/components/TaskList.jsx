import React, { useState, useEffect } from 'react';
import Task from './Task';
import CardList from './CardList';
import TaskCoinReceived from '../constants/TaskCoinRecived.json';
import { getItem, setItem, removeItem } from '../utils/indexedDB';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [category, setCategory] = useState('work');
  const [difficulty, setDifficulty] = useState('medium');
  const [coins, setCoins] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const saved = (await getItem('tasks')) || [];
        if (Array.isArray(saved)) {
          const normalized = saved.map(t => ({ ...t, rewarded: t.rewarded ?? false }));
          setTasks(normalized);
        } else {
          setTasks([]);
        }

        const savedCoins = await getItem('coins');
        setCoins(Number(savedCoins || 0));

        const applied = (await getItem('appliedTx')) || [];
        await setItem('appliedTx', applied);
      } catch (err) {
        console.error('Error loading data from IndexedDB:', err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function saveTasks() {
      try {
        await setItem('tasks', tasks);
      } catch (err) {
        console.error('Error saving tasks:', err);
      }
    }
    if (!loading) saveTasks();
  }, [tasks, loading]);

  useEffect(() => {
    async function saveCoins() {
      try {
        await setItem('coins', coins);
      } catch (err) {
        console.error('Error saving coins:', err);
      }
    }
    if (!loading) saveCoins();
  }, [coins, loading]);

  const addTask = () => {
    if (newTaskName.trim() === '') return;
    const newTask = {
      id: Date.now(),
      name: newTaskName.trim(),
      category,
      difficulty,
      completed: false,
      rewarded: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    setCategory('work');
    setDifficulty('medium');
  };

  const getAmountForTask = (t) => {
    const cat = t.category || 'work';
    const diff = t.difficulty || 'medium';
    const amtRaw = (TaskCoinReceived[cat] && TaskCoinReceived[cat][diff]);
    return Number(amtRaw) || 0;
  };

  const completeTask = (id) => {
    (async () => {
      const appliedTx = (await getItem('appliedTx')) || [];
      const txId = `reward:${id}`;

      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const willComplete = !task.completed;
      const amount = getAmountForTask(task);

      let delta = 0;
      let nextApplied = [...appliedTx];

      if (willComplete && !task.rewarded && !appliedTx.includes(txId)) {
        delta += amount;
        nextApplied.push(txId);
      } else if (!willComplete && task.rewarded && appliedTx.includes(txId)) {
        delta -= amount;
        nextApplied = nextApplied.filter(x => x !== txId);
      }

      setTasks(prev => prev.map(t => {
        if (t.id !== id) return t;
        if (willComplete && !t.rewarded && !appliedTx.includes(txId)) {
          return { ...t, completed: true, rewarded: true };
        } else if (!willComplete && t.rewarded && appliedTx.includes(txId)) {
          return { ...t, completed: false, rewarded: false };
        } else {
          return { ...t, completed: willComplete };
        }
      }));

      if (nextApplied.length !== appliedTx.length) {
        await setItem('appliedTx', nextApplied);
      }

      if (delta !== 0) {
        setCoins(c => Number((c + delta).toFixed(2)));
      }
    })();
  };

  const deleteTask = (id) => {
    (async () => {
      const appliedTx = (await getItem('appliedTx')) || [];
      const txId = `reward:${id}`;
      const t = tasks.find(x => x.id === id);

      let delta = 0;
      let nextApplied = [...appliedTx];

      if (t && t.rewarded && appliedTx.includes(txId)) {
        const amount = getAmountForTask(t);
        delta -= amount;
        nextApplied = nextApplied.filter(x => x !== txId);
      }

      setTasks(prev => prev.filter(task => task.id !== id));

      if (nextApplied.length !== appliedTx.length) {
        await setItem('appliedTx', nextApplied);
      }
      if (delta !== 0) {
        setCoins(c => Number((c + delta).toFixed(2)));
      }
    })();
  };

  const moveTaskUp = (id) => {
    setTasks(prev => {
      const index = prev.findIndex(task => task.id === id);
      if (index > 0) {
        const arr = [...prev];
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
        return arr;
      }
      return prev;
    });
  };

  const moveTaskDown = (id) => {
    setTasks(prev => {
      const index = prev.findIndex(task => task.id === id);
      if (index !== -1 && index < prev.length - 1) {
        const arr = [...prev];
        [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
        return arr;
      }
      return prev;
    });
  };

  const handleResetAll = async () => {
    const ok = window.confirm('Are you sure you want to reset all tasks, purchases, and coins? This action is irreversible. ⚠️');
    if (!ok) return;
    try {
      await removeItem('tasks');
      await removeItem('coins');
      await removeItem('purchases');
      await removeItem('cardOrder');
      await removeItem('cardStars');
      await removeItem('appliedTx');
    } catch (err) {
      console.error('Error clearing IndexedDB:', err);
    }
    setTasks([]);
    setCoins(0);
    setResetSignal(s => s + 1);
  };

  if (loading) return <div className="loading-text">Loading tasks...</div>;

  return (
    <div className="task-list-root">
      <div className="task-list-header">
        <h3 className="task-title">Professional Task List</h3>

        <div className="task-stats">
          <span className="coin-icon">🪙</span>
          <span className="coin-value">{coins}</span>

          <button className="icon-btn" title="Reset everything" onClick={handleResetAll} aria-label="reset">
            ⟲
          </button>
        </div>
      </div>

      <div className="tasks-box glass-card">
        {tasks.length === 0 ? (
          <p className="empty-text">No tasks yet. Add one below!</p>
        ) : (
          <ul className="tasks-list">
            {tasks.map((task, index) => (
              <li key={task.id} className="tasks-list-item">
                <Task
                  task={task}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  onMoveUp={moveTaskUp}
                  onMoveDown={moveTaskDown}
                  isFirst={index === 0}
                  isLast={index === tasks.length - 1}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="task-form">
          <input
            className="text-input"
            placeholder="Enter task name"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            aria-label="new-task-name"
          />

          <div className="select-row">
            <label className="select-label">
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="category">
                <option value="body">Body</option>
                <option value="mind">Mind</option>
                <option value="work">Work</option>
              </select>
            </label>

            <label className="select-label">
              <span>Difficulty</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="btn-simple btn-add" onClick={addTask}>Add Task</button>
          </div>
        </div>
      </div>

      <div className="cardlist-wrap">
        <CardList coins={coins} setCoins={setCoins} resetSignal={resetSignal} />
      </div>
    </div>
  );
};

export default TaskList;
