import { useState, useEffect } from 'react';
import { useTable } from 'spacetimedb/react';
import { tables } from '../../module_bindings';
import './AdminClassSessionResult.css';

interface ResultItem {
  plant: string;
  photos: Array<{ dataUrl: string; nickname: string; reason: string; isCorrect: boolean }>;
}

export function AdminClassSessionResult({
  accessCode,
  plantType,
  onBack
}: {
  accessCode: string;
  plantType: string;
  onBack: () => void;
}) {
  const [classSessionUploads] = useTable(tables.class_sessions_uploads);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const plantUploads = classSessionUploads.filter(
    u => u.accessCode === accessCode && u.plantAnswerType === plantType
  );

  const correctPhotos = plantUploads.filter(u => u.plantAnswerType === u.plantCorrectType);
  const incorrectUploads = plantUploads.filter(u => u.plantAnswerType !== u.plantCorrectType);

  return (
    <div className="result-container">
      <div className="result-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2 className="result-title">作答結果 - {plantType}</h2>
      </div>

      {/* Correct answers gallery */}
      <div className="result-section">
        <h3 className="section-title">✓ 正確作答</h3>
        {correctPhotos.length === 0 ? (
          <div className="empty-gallery">
            <p>暫無正確作答</p>
          </div>
        ) : (
          <div className="photos-scrollable">
            {correctPhotos.map((upload, idx) => (
              <div key={`${idx}-correct`} className="photo-card">
                <img src={upload.photoBlob} alt={`correct-${idx}`} className="photo-thumbnail" />
                <span className="photo-badge correct">✓</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incorrect answers list */}
      <div className="result-section">
        <h3 className="section-title">✕ 錯誤作答</h3>
        {incorrectUploads.length === 0 ? (
          <div className="empty-list">
            <p>暫無錯誤作答</p>
          </div>
        ) : (
          <div className="incorrect-list">
            {incorrectUploads.map((upload, idx) => (
              <div key={`${idx}-incorrect`} className="incorrect-item">
                <div
                  className="item-header"
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                >
                  <div className="item-left">
                    <img src={upload.photoBlob} alt={`incorrect-${idx}`} className="item-thumbnail" />
                    <div className="item-info">
                      <div className="incorrect-text">提交: {upload.plantAnswerType}</div>
                      <div className="correct-text">正確: {upload.plantCorrectType}</div>
                    </div>
                  </div>
                  <span className="expand-icon">{expandedIndex === idx ? '▼' : '▶'}</span>
                </div>

                {expandedIndex === idx && (
                  <div className="item-expanded">
                    <div className="expanded-row">
                      <label>學生名稱：</label>
                      <span>{upload.creatorNickname}</span>
                    </div>
                    <div className="expanded-row">
                      <label>說明原因：</label>
                      <p className="reason-text">{upload.reason}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
