import { useState, useEffect } from 'react';
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables, reducers } from '../../module_bindings';
import { useReducer } from 'spacetimedb/react';
import { Modal } from '../../components/Modal';
import './AdminClassSessionManage.css';

function generateAccessCode(): string {
  return String(Math.floor(Math.random() * 900000) + 100000);
}

const DURATION_OPTIONS = [
  { value: 15, label: '15分鐘' },
  { value: 30, label: '30分鐘' },
  { value: 45, label: '45分鐘' },
  { value: 60, label: '60分鐘' }
];

export function AdminClassSessionManage({ onSelectSession }: { onSelectSession: (accessCode: string) => void }) {
  const [sessions, sessionsReady] = useTable(tables.class_sessions);
  const [duration, setDuration] = useState(15);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [contentReady, setContentReady] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; title: string; message: string; accessCode?: string } | null>(null);
  const createClassSession = useReducer(reducers.createClassSession);
  const { getConnection } = useSpacetimeDB();

  const conn = getConnection();
  const myIdentity = conn?.identity?.toHexString();

  useEffect(() => {
    if (sessionsReady) {
      setContentReady(true);
    }
  }, [sessionsReady]);

  const now = Date.now();
  const mySessions = sessions.filter(s => s.creatorId.toHexString?.() === myIdentity);

  const activeSessions = mySessions.filter(s => s.endTime > now);
  const expiredSessions = mySessions.filter(s => s.endTime <= now);

  const displayedSessions = activeTab === 'active' ? activeSessions : expiredSessions;

  function handleCreateSession() {
    const accessCode = generateAccessCode();
    console.log('Creating session with:', { accessCode, durationMinutes: duration });
    createClassSession({
      accessCode: accessCode,
      durationMinutes: duration
    })
      .then(() => {
        console.log('Session created successfully, current sessions:', sessions.length);
        setModal({
          type: 'success',
          title: '課室已建立',
          message: '課程現已可供學生加入',
          accessCode: accessCode
        });
      })
      .catch((err: any) => {
        console.error('Create session error:', err);
        setModal({
          type: 'error',
          title: '建立失敗',
          message: String(err)
        });
      });
  }

  if (!contentReady) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">加載中...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">課室管理</h2>

      <div className="create-session-section">
        <div className="duration-selector">
          <label>課堂時長：</label>
          <select
            className="duration-select"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          >
            {DURATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary create-btn" onClick={handleCreateSession}>
          ➕ 建立課室
        </button>
      </div>

      <div className="tabs-section">
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          進行中 ({activeSessions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('expired')}
        >
          已過期 ({expiredSessions.length})
        </button>
      </div>

      <div className="sessions-list">
        {displayedSessions.length === 0 ? (
          <div className="empty-state">
            <p>{activeTab === 'active' ? '沒有進行中的課室' : '沒有過期的課室'}</p>
          </div>
        ) : (
          displayedSessions.map(session => (
            <div
              key={session.accessCode}
              className="session-card clickable"
              onClick={() => onSelectSession(session.accessCode)}
            >
              <div className="session-header">
                <span className="session-code">課程碼: {session.accessCode}</span>
                <span className={`session-status ${activeTab === 'active' ? 'active' : 'expired'}`}>
                  {activeTab === 'active' ? '進行中' : '已過期'}
                </span>
              </div>
              <div className="session-time">
                <span>開始: {new Date(session.startTime).toLocaleString('zh-Hant')}</span>
                <span>結束: {new Date(session.endTime).toLocaleString('zh-Hant')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <Modal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          accessCode={modal.accessCode}
          onConfirm={() => setModal(null)}
        />
      )}
    </div>
  );
}
