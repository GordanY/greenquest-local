import { useEffect, useState, useMemo } from 'react';
import { tables, reducers } from '../../module_bindings';
import { useReducer, useTable, useSpacetimeDB } from 'spacetimedb/react';
import { useAuth0 } from '@auth0/auth0-react';
import { xpToLevel, xpToNextLevel, levelToPetStage } from './UserPet';
import { UserPet } from './UserPet';
import { UserPokedex } from './UserPokedex';
import { UserShop } from './UserShop';
import { UserChallenge } from './UserChallenge';
import { UserRanking } from './UserRanking';
import { AdminClassSessionManage } from './AdminClassSessionManage';
import './UserHome.css';

export default function UserHome() {
  const { user } = useAuth0();
  const [my_profile, profile_ready] = useTable(tables.get_user_profile);
  const [users] = useTable(tables.user);
  const [page, setPage] = useState('home');
  const [userInited, setUserInited] = useState(false);
  const [selectedPet, setSelectedPet] = useState('種籽');
  const [petName, setPetName] = useState('種籽');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const createNewUser = useReducer(reducers.createNewUser);
  const activateAdmin = useReducer(reducers.activateAdmin);
  const { getConnection } = useSpacetimeDB();
  const conn = getConnection();
  const myUser = users.find(u => u.id.equals(conn?.identity));

  useEffect(()=>{
    // Initialize when both profile is ready and data is populated
    if (profile_ready && my_profile.length > 0) {
      setUserInited(true);
    }
  }, [profile_ready, my_profile]);

  function handleUserInit(e: any) {
    e.preventDefault();
    if (user?.name === undefined || user?.name === null || user?.name.length <= 0) {
      console.log(`cannot get user name from auth0 token ${JSON.stringify(user)}`);
      return;
    }
    createNewUser({
      name: user?.name,
      petType: selectedPet,
      petName: petName
    }).then(() => {
      setUserInited(true);
    }).catch(err => {
      console.log(`error when createNewUser: ${err}`);
    });
  }

  function handleAdminSubmit(e: any) {
    e.preventDefault();
    if (!adminPasscode.trim()) {
      alert('請輸入管理員密碼');
      return;
    }
    activateAdmin({ key: adminPasscode })
      .then(() => {
        alert('管理員權限已啟用！');
        setShowAdminModal(false);
        setAdminPasscode('');
      })
      .catch((err: any) => {
        alert(`錯誤: ${String(err)}`);
        console.error('Admin activation error:', err);
      });
  }

  const profile = my_profile[0];
  const level = xpToLevel(profile?.experiencePoints || 0);
  const nextLevelXp = xpToNextLevel(level + 1);
  const xp = (profile?.experiencePoints || 0) % nextLevelXp;
  const xpPercentage = ((xp / nextLevelXp) * 100);
  const seeds = profile?.seeds || 0;

  const petImage = useMemo<string>(() => {
    if (!profile) return '/pets/Pet1_1.png';
    let type_index: number;
    let stage_index = levelToPetStage(xpToLevel(profile.experiencePoints));
    if (profile.petType === '種籽') {
      type_index = 1;
    } else {
      type_index = 2;
    }
    return `/pets/Pet${type_index}_${stage_index}.png`;
  }, [profile]);

  return (
    <div className="user-home-container">
      {!profile_ready && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p className="loading-text">Loading...</p>
        </div>
      )}
      {profile_ready && !userInited && (
        <UserPet
          selectedPet={selectedPet}
          setSelectedPet={setSelectedPet}
          petName={petName}
          setPetName={setPetName}
          onSubmit={handleUserInit}
        />
      )}
      {profile_ready && userInited && (
        <>
          <div className="screen-container">
            {page === 'home' && (
              <div className="home-screen">
                <header className="home-header">
                  <div className="level-pill">
                    <span className="level-text">Lv.{level}</span>
                    <div className="xp-bar-container">
                      <div className="xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                    <span className="xp-text">{xp}/{nextLevelXp}</span>
                  </div>
                  <div className="header-buttons">
                    {/* <button className="icon-button">🏆</button> */}
                    <div className="seed-display">
                      <span className="seed-emoji">🌿</span>
                      <span className="seed-count">{seeds}</span>
                    </div>
                  </div>
                </header>
                <main className="pet-section">
                  <div className="pet-display-area">
                    <img src={petImage} alt="pet" className="pet-image" />
                    <p className="pet-name">{profile?.petName}</p>
                  </div>
                </main>
              </div>
            )}
            {page === 'challenge' && <UserChallenge />}
            {page === 'ranking' && <UserRanking />}
            {page === 'shop' && <UserShop />}
            {page === 'pokedex' && <UserPokedex />}
            {page === 'admin' && <AdminClassSessionManage />}
          </div>

          <nav className="nav-bar">
            <button
              className={`nav-button ${page === 'home' ? 'active' : ''}`}
              onClick={() => setPage('home')}
            >
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="nav-label">主頁</span>
            </button>
            <button
              className={`nav-button ${page === 'challenge' ? 'active' : ''}`}
              onClick={() => setPage('challenge')}
            >
              <span style={{ fontSize: '1.5rem' }}>📷</span>
              <span className="nav-label">挑戰</span>
            </button>
            <button
              className={`nav-button ${page === 'ranking' ? 'active' : ''}`}
              onClick={() => setPage('ranking')}
            >
              <span style={{ fontSize: '1.5rem' }}>🏅</span>
              <span className="nav-label">排名</span>
            </button>
            <button
              className={`nav-button ${page === 'pokedex' ? 'active' : ''}`}
              onClick={() => setPage('pokedex')}
            >
              <span style={{ fontSize: '1.5rem' }}>📕</span>
              <span className="nav-label">圖鑒</span>
            </button>
            <button
              className={`nav-button ${page === 'shop' ? 'active' : ''}`}
              onClick={() => setPage('shop')}
            >
              <span style={{ fontSize: '1.5rem' }}>🛍️</span>
              <span className="nav-label">商店</span>
            </button>
            {myUser?.role === 'admin' && (
              <button
                className={`nav-button ${page === 'admin' ? 'active' : ''}`}
                onClick={() => setPage('admin')}
              >
                <span style={{ fontSize: '1.5rem' }}>🏫</span>
                <span className="nav-label">課室</span>
              </button>
            )}
          </nav>

          {showAdminModal && (
            <div className="admin-modal-overlay">
              <div className="admin-modal">
                <h3 className="admin-modal-title">輸入管理員密碼</h3>
                <input
                  type="password"
                  className="admin-modal-input"
                  placeholder="管理員密碼"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                />
                <div className="admin-modal-actions">
                  <button className="btn btn-primary" onClick={handleAdminSubmit}>提交</button>
                  <button className="btn btn-secondary" onClick={() => { setShowAdminModal(false); setAdminPasscode(''); }}>取消</button>
                </div>
              </div>
            </div>
          )}

          <button
            className="admin-activation-btn"
            onClick={() => setShowAdminModal(true)}
            title="啟用管理員"
          >
            ⚙️
          </button>
        </>
      )}
    </div>
  );
}
