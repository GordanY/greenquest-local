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
import { UserTasks } from './UserTasks';
import { AdminClassSessionManage } from './AdminClassSessionManage';
import { AdminClassSession } from './AdminClassSession';
import { AdminClassSessionResult } from './AdminClassSessionResult';
import { Modal } from '../../components/Modal';
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
  const [adminSubPage, setAdminSubPage] = useState<'manage' | 'session' | 'result'>('manage');
  const [selectedSessionCode, setSelectedSessionCode] = useState('');
  const [selectedPlantType, setSelectedPlantType] = useState('');
  const [modal, setModal] = useState<{ type: 'error' | 'success' | 'warning'; title: string; message: string } | null>(null);
  const createNewUser = useReducer(reducers.createNewUser);
  const activateAdmin = useReducer(reducers.activateAdmin);
  const { getConnection } = useSpacetimeDB();
  const conn = getConnection();
  const myUser = users.find(u => u.id.equals(conn.identity));

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
    }).catch(err => {
      console.log(`error when createNewUser: ${err}`);
    });
  }

  function handleAdminSubmit(e: any) {
    e.preventDefault();
    if (!adminPasscode.trim()) {
      setModal({
        type: 'warning',
        title: '缺少密碼',
        message: '請輸入管理員密碼'
      });
      return;
    }
    activateAdmin({ key: adminPasscode })
      .then(() => {
        setModal({
          type: 'success',
          title: '成功',
          message: '管理員權限已啟用！'
        });
        setTimeout(() => {
          setShowAdminModal(false);
          setAdminPasscode('');
          setModal(null);
        }, 1500);
      })
      .catch((err: any) => {
        setModal({
          type: 'error',
          title: '啟用失敗',
          message: String(err)
        });
        console.error('Admin activation error:', err);
      });
  }

  const profile = my_profile[0];
  const currentXp = profile?.experiencePoints || 0;
  const level = xpToLevel(currentXp);

  // Calculate XP progress within current level
  const totalXpToCurrentLevel = (4 + (level - 1)) * (level - 1);
  const totalXpToNextLevel = (4 + level) * level;
  const xpInCurrentLevel = currentXp - totalXpToCurrentLevel;
  const xpNeededForNextLevel = totalXpToNextLevel - totalXpToCurrentLevel;
  const xpPercentage = ((xpInCurrentLevel / xpNeededForNextLevel) * 100);
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
    <div className="user-home-container screen-base">
      {!profile_ready && !userInited && (
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
      {userInited && (
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
                    <span className="xp-text">{xpInCurrentLevel}/{xpNeededForNextLevel}</span>
                  </div>
                  <div className="header-buttons">
                    <button className="icon-button tasks-btn" onClick={() => setPage('tasks')} title="每日任務">
                      📋
                    </button>
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
            {page === 'tasks' && <UserTasks onBack={() => setPage('home')} />}
            {page === 'shop' && <UserShop />}
            {page === 'pokedex' && <UserPokedex />}
            {page === 'admin' && (
              <>
                {adminSubPage === 'manage' && (
                  <AdminClassSessionManage
                    onSelectSession={(code) => {
                      setSelectedSessionCode(code);
                      setAdminSubPage('session');
                    }}
                  />
                )}
                {adminSubPage === 'session' && (
                  <AdminClassSession
                    accessCode={selectedSessionCode}
                    onBack={() => setAdminSubPage('manage')}
                    onSelectPlant={(plant) => {
                      setSelectedPlantType(plant);
                      setAdminSubPage('result');
                    }}
                  />
                )}
                {adminSubPage === 'result' && (
                  <AdminClassSessionResult
                    accessCode={selectedSessionCode}
                    plantType={selectedPlantType}
                    onBack={() => setAdminSubPage('session')}
                  />
                )}
              </>
            )}
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
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="nav-label">挑戰</span>
            </button>
            <button
              className={`nav-button ${page === 'ranking' ? 'active' : ''}`}
              onClick={() => setPage('ranking')}
            >
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="nav-label">排名</span>
            </button>
            <button
              className={`nav-button ${page === 'pokedex' ? 'active' : ''}`}
              onClick={() => setPage('pokedex')}
            >
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="nav-label">圖鑒</span>
            </button>
            <button
              className={`nav-button ${page === 'shop' ? 'active' : ''}`}
              onClick={() => setPage('shop')}
            >
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="nav-label">商店</span>
            </button>
            {myUser?.role === 'admin' && (
              <button
                className={`nav-button ${page === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setPage('admin');
                  setAdminSubPage('manage');
                }}
              >
                <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 9H7a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-2" />
                </svg>
                <span className="nav-label">課室</span>
              </button>
            )}
          </nav>

          {modal && (
            <Modal
              type={modal.type}
              title={modal.title}
              message={modal.message}
              onConfirm={() => setModal(null)}
            />
          )}

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
