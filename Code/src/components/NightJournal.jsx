import React from 'react';
import './NightJournal.css';

const NightJournal = ({ open, onClose, name, data = {}, setData }) => {
  if (!open) return null;

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setData(prev => ({ ...prev, [field]: value, savedAt: Date.now(), name: name || prev.name || '' }));
  };

  const handleSave = () => {
    onClose && onClose();
  };

  return (
    <div className="night-modal-backdrop">
      <div className="night-modal glass-card">
        <h2 className="modal-title">Night Journal</h2>
        <p className="modal-description">
          {name ? `${name}, how do you feel this evening?` : 'How do you feel this evening?'}
          <br />
          (answer with an emoji or a few words)
        </p>
        <input
          className="modal-input"
          placeholder="🙂 😌 😴"
          value={data.feeling || ''}
          onChange={handleChange('feeling')}
        />

        <p className="modal-description">
          {name ? `${name}, what learnings from today will you implement in the future?` : 'What learnings from today will you implement in the future?'}
        </p>
        <textarea
          className="modal-textarea"
          placeholder="Lessons, insights, mistakes to avoid"
          value={data.learning || ''}
          onChange={handleChange('learning')}
        />

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default NightJournal;