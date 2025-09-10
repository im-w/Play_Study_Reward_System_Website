import React from 'react';
import './MorningJournal.css';

const MorningJournal = ({ open, onClose, name, data = {}, setData }) => {
  if (!open) return null;

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setData(prev => ({ ...prev, [field]: value, savedAt: Date.now(), name: name || prev.name || '' }));
  };

  const handleSave = () => {
    onClose && onClose();
  };

  return (
    <div className="morning-modal-backdrop">
      <div className="morning-modal glass-card">
        <h2 className="modal-title">Morning Journal</h2>
        <p className="modal-description">
          Get specific, {name || 'friend'}! Use details to describe what you're feeling grateful for.
        </p>
        <textarea
          className="modal-textarea"
          placeholder="3 Things I Am Grateful For"
          value={data.grateful || ''}
          onChange={handleChange('grateful')}
        />

        <p className="modal-description">Keep these small and achievable so you actually go out and complete them.</p>
        <textarea
          className="modal-textarea"
          placeholder="What Will I Do To Make Today Great?"
          value={data.todayDo || ''}
          onChange={handleChange('todayDo')}
        />

        <p className="modal-description">Choose powerful words and phrases to imprint on your subconscious mind.</p>
        <textarea
          className="modal-textarea"
          placeholder="Daily Affirmations"
          value={data.affirmations || ''}
          onChange={handleChange('affirmations')}
        />

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default MorningJournal;
