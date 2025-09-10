
import React, { useEffect, useState } from 'react';
import './JournalPanel.css';
import MorningJournal from './MorningJournal';
import NightJournal from './NightJournal';
import { WbSunny, NightsStay, RestartAlt } from '@mui/icons-material';

const MORNING_KEY = 'journal:morning';
const NIGHT_KEY = 'journal:night';

const emptyMorning = (name = '') => ({ name, grateful: '', todayDo: '', affirmations: '', savedAt: null });
const emptyNight = (name = '') => ({ name, feeling: '', learning: '', savedAt: null });

const JournalPanel = ({ profileName }) => {
  const [openMorning, setOpenMorning] = useState(false);
  const [openNight, setOpenNight] = useState(false);

  const [morningData, setMorningData] = useState(() => {
    try {
      const raw = localStorage.getItem(MORNING_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return emptyMorning(profileName || '');
  });

  const [nightData, setNightData] = useState(() => {
    try {
      const raw = localStorage.getItem(NIGHT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return emptyNight(profileName || '');
  });

  useEffect(() => {
    setMorningData(prev => ({ ...prev, name: profileName || '' }));
    setNightData(prev => ({ ...prev, name: profileName || '' }));
  }, [profileName]);

  useEffect(() => {
    try {
      localStorage.setItem(MORNING_KEY, JSON.stringify(morningData));
    } catch (e) {}
  }, [morningData]);

  useEffect(() => {
    try {
      localStorage.setItem(NIGHT_KEY, JSON.stringify(nightData));
    } catch (e) {}
  }, [nightData]);

  const handleReset = () => {
    if (!window.confirm('Warning! Deleting your Morning and Night Journal entries is permanent. Are you sure you want to proceed? 🚫📓')) return;

    try {
      localStorage.removeItem(MORNING_KEY);
      localStorage.removeItem(NIGHT_KEY);
    } catch (e) {}

    setMorningData(emptyMorning(profileName || ''));
    setNightData(emptyNight(profileName || ''));

    setOpenMorning(false);
    setOpenNight(false);

    alert('Journal entries deleted successfully! ✅📓');
  };

  return (
    <div className="journal-panel">
      <div className="panel-top">
        <div className="panel-buttons">
          <button className="panel-btn morning" onClick={() => setOpenMorning(true)} title="Morning Journal">
            <WbSunny fontSize="inherit" />
          </button>

          <button className="panel-btn night" onClick={() => setOpenNight(true)} title="Night Journal">
            <NightsStay fontSize="inherit" />
          </button>

          <button className="panel-btn reset" onClick={handleReset} title="Reset Journals">
            <RestartAlt fontSize="inherit" />
          </button>
        </div>
      </div>

      <MorningJournal
        open={openMorning}
        onClose={() => setOpenMorning(false)}
        data={morningData}
        setData={setMorningData}
        name={profileName}
      />

      <NightJournal
        open={openNight}
        onClose={() => setOpenNight(false)}
        data={nightData}
        setData={setNightData}
        name={profileName}
      />
    </div>
  );
};

export default JournalPanel;
