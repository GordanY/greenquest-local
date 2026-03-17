import { useState, useEffect } from 'react';
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '../../module_bindings';
import './AdminClassSession.css';

export function AdminClassSession({ accessCode, onBack }: { accessCode: string; onBack: () => void }) {
  const [classSessionUploads, uploadsReady] = useTable(tables.class_sessions_uploads);
  const [sessions] = useTable(tables.class_sessions);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [contentReady, setContentReady] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>('00:00:00');

  const currentSession = sessions.find(s => s.accessCode === accessCode);
  const now = Date.now();
  const isExpired = currentSession && currentSession.endTime <= now;

  // Update countdown timer
  useEffect(() => {
    if (!currentSession) return;

    const updateTimer = () => {
      const remaining = Math.max(0, currentSession.endTime - Date.now());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setRemainingTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentSession]);

  useEffect(() => {
    if (uploadsReady) {
      setContentReady(true);
    }
  }, [uploadsReady]);

  const sessionUploads = classSessionUploads.filter(u => u.accessCode === accessCode);

  // Group uploads by plant type and count correct/incorrect
  const plantStats = new Map<string, { correct: number; incorrect: number }>();

  sessionUploads.forEach(upload => {
    const plantType = upload.plantAnswerType;
    if (!plantStats.has(plantType)) {
      plantStats.set(plantType, { correct: 0, incorrect: 0 });
    }

    const stat = plantStats.get(plantType)!;
    const isCorrect = upload.plantAnswerType === upload.plantCorrectType;
    if (isCorrect) {
      stat.correct++;
    } else {
      stat.incorrect++;
    }
  });

  const activeStats = Array.from(plantStats.entries()).map(([plant, stats]) => ({
    plant,
    ...stats
  }));

  const expiredStats = [...activeStats]; // For demo, same data

  const displayedStats = activeTab === 'active' ? activeStats : expiredStats;

  if (!contentReady || !currentSession) {
    return (
      <div className="admin-session-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">加載中...</p>
      </div>
    );
  }

  return (
    <div className="admin-session-container">
      <div className="admin-session-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2 className="admin-session-title">課室監督</h2>
      </div>

      <div className="session-info-box">
        <div className="info-row">
          <label className="info-label">課程碼：</label>
          <span className="access-code">{currentSession.accessCode}</span>
        </div>
        <div className="info-row">
          <label className="info-label">剩餘時間：</label>
          <span className={`countdown-timer ${isExpired ? 'expired' : ''}`}>{remainingTime}</span>
        </div>
      </div>

      <div className="tabs-section">
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          進行中
        </button>
        <button
          className={`tab-btn ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('expired')}
        >
          已過期
        </button>
      </div>

      <div className="stats-list">
        {displayedStats.length === 0 ? (
          <div className="empty-state">
            <p>暫無上載紀錄</p>
          </div>
        ) : (
          <div className="stats-table">
            <div className="table-header">
              <div className="col col-plant">植物類型</div>
              <div className="col col-correct">✓ 正確</div>
              <div className="col col-incorrect">✕ 錯誤</div>
            </div>
            {displayedStats.map(stat => (
              <div key={stat.plant} className="table-row">
                <div className="col col-plant">{stat.plant}</div>
                <div className="col col-correct">
                  <span className="stat-badge correct">{stat.correct}</span>
                </div>
                <div className="col col-incorrect">
                  <span className="stat-badge incorrect">{stat.incorrect}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
