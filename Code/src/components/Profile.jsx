import React, { useEffect, useState } from 'react';
import { getItem, setItem } from '../utils/indexedDB';
import './Profile.css';

const LOCAL_KEY = 'app:profile';

const Profile = ({ name, setName }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getItem(LOCAL_KEY);
        if (data?.name) {
          setName(data.name);
        }
      } catch (err) {
        console.error('Error loading profile from IndexedDB', err);
      } finally {
        setLoading(false);
      }
    }
    if (!name) loadProfile();
  }, [name, setName]);

  const handleChange = async (value) => {
    setName(value);
    try {
      await setItem(LOCAL_KEY, { name: value, img: '' });
    } catch (err) {
      console.error('Error saving profile to IndexedDB', err);
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="glass-card profile-card">

      <div className="profile-body">
        <img className="profile-avatar" src="../../public/pictures/profile-pic.jpg" alt="profile" />
        <div className="profile-info">
          <input
            type="text"
            className="profile-input"
            value={name || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
