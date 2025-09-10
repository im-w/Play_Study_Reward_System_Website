import React, { useMemo, useState, useEffect } from 'react';
import './SpiderChart.css';

const MAX = 20;
const AXES = [
  { key: 'work', label: 'work' },
  { key: 'mind', label: 'mind' },
  { key: 'body', label: 'body' },
];
const DB_NAME = 'appDB';
const STORE_NAME = 'spiderChart';
const DB_VERSION = 1;
const ENTRY_KEY = 'data';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function getData(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(ENTRY_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function setData(db, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, ENTRY_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

const degreesToRad = (deg) => (deg * Math.PI) / 180;

const SpiderChart = ({ initial = { work: 0, mind: 0, body: 0 } }) => {
  const [values, setValues] = useState({
    work: String(initial.work ?? 0),
    mind: String(initial.mind ?? 0),
    body: String(initial.body ?? 0),
  });
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);

  useEffect(() => {
    let canceled = false;
    openDB()
      .then(database => {
        if (canceled) return;
        setDb(database);
        return getData(database);
      })
      .then(saved => {
        if (canceled) return;
        if (saved && typeof saved === 'object') {
          setValues({
            work: String(saved.work ?? 0),
            mind: String(saved.mind ?? 0),
            body: String(saved.body ?? 0),
          });
        }
      })
      .catch(err => {
        console.error('Error loading spider chart data from IndexedDB:', err);
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!db) return;
    setData(db, {
      work: values.work,
      mind: values.mind,
      body: values.body,
    }).catch(err => {
      console.error('Error saving spider chart data to IndexedDB:', err);
    });
  }, [values, db]);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const onChange = (key, raw) => {
    if (raw === '') {
      setValues(prev => ({ ...prev, [key]: '' }));
      return;
    }
    if (!/^\d*\.?\d*$/.test(raw)) return;
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed) && parsed > MAX) {
      setValues(prev => ({ ...prev, [key]: String(MAX) }));
      return;
    }
    setValues(prev => ({ ...prev, [key]: raw }));
  };

  const clear = () => {
    setValues({ work: '0', mind: '0', body: '0' });
  };

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 90;
  const angles = useMemo(() => [-90, 30, 150], []);

  const numeric = useMemo(() => {
    return AXES.reduce((acc, ax) => {
      const v = parseFloat(values[ax.key]);
      acc[ax.key] = Number.isFinite(v) ? clamp(v, 0, MAX) : 0;
      return acc;
    }, {});
  }, [values]);

  const points = useMemo(() => {
    return AXES.map((axis, i) => {
      const v = numeric[axis.key];
      const ratio = v / MAX;
      const r = ratio * radius;
      const ang = degreesToRad(angles[i]);
      const x = cx + r * Math.cos(ang);
      const y = cy + r * Math.sin(ang);
      return { x, y, key: axis.key, value: numeric[axis.key] };
    });
  }, [numeric, radius, cx, cy, angles]);

  const ringPolygons = useMemo(() => {
    const rings = [];
    const steps = 4;
    for (let s = 1; s <= steps; s++) {
      const r = (radius * s) / steps;
      const pts = angles.map((ang) => {
        const a = degreesToRad(ang);
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      });
      rings.push(pts.join(' '));
    }
    return rings;
  }, [radius, cx, cy, angles]);

  const polygonPointsStr = points.map(p => `${p.x},${p.y}`).join(' ');

  if (loading) return <div className="spider-loading">Loading spider chart...</div>;

  return (
    <div className="glass-card spider-card">
      <div className="spider-header">
        <span className="spider-title">Spider Chart</span>
      </div>

      <div className="spider-body">
        <div className="spider-controls">
          {AXES.map(ax => (
            <label key={ax.key} className="spider-row">
              <span className="spider-label">{ax.label}</span>
              <input
                className="spider-input"
                type="text"
                inputMode="decimal"
                pattern="\\d*\\.?\\d*"
                maxLength={6}
                value={values[ax.key]}
                onChange={(e) => onChange(ax.key, e.target.value)}
                placeholder={`0 - ${MAX}`}
                aria-label={`spider-${ax.key}`}
              />
              <span className="spider-max">/ {MAX}</span>
            </label>
          ))}

          <div className="spider-actions">
            <button className="btn-clear" type="button" onClick={clear}>Clear</button>
          </div>
        </div>

        <div className="spider-visual">
          <svg className="spider-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="spider chart">
            {ringPolygons.map((pts, i) => (
              <polygon key={`ring-${i}`} className="spider-ring" points={pts} />
            ))}

            {angles.map((ang, i) => {
              const a = degreesToRad(ang);
              const x = cx + radius * Math.cos(a);
              const y = cy + radius * Math.sin(a);
              return <line key={`axis-${i}`} className="spider-axis" x1={cx} y1={cy} x2={x} y2={y} />;
            })}

            {angles.map((ang, i) => {
              const a = degreesToRad(ang);
              const lx = cx + (radius + 14) * Math.cos(a);
              const ly = cy + (radius + 14) * Math.sin(a);
              const align = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
              return (
                <text
                  key={`lab-${i}`}
                  x={lx}
                  y={ly}
                  className="spider-label-text"
                  textAnchor={align}
                  dominantBaseline="middle"
                >
                  {AXES[i].label}
                </text>
              );
            })}

            <polygon className="spider-fill" points={polygonPointsStr} />

            {points.map((p, i) => (
              <circle key={`pt-${i}`} className="spider-point" cx={p.x} cy={p.y} r={3} />
            ))}

            <circle cx={cx} cy={cy} r={2} className="spider-center" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SpiderChart;
