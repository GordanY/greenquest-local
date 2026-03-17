import { useState, useEffect, useRef } from 'react';
import { useTable } from 'spacetimedb/react';
import { tables } from '../../module_bindings';
import { useGuestProfileContext } from './GuestProfileProvider';
import { GuestChallenge } from './GuestChallenge';
import './GuestHome.css';

function GuestHomeScreen({
  accessCode,
  nickname,
  questionId,
  setQuestionId,
  plantTypes,
  classSession
}: {
  accessCode: string;
  nickname: string;
  questionId: number;
  setQuestionId: (id: number) => void;
  plantTypes: readonly any[];
  classSession: any;
}) {
  const [remainingTime, setRemainingTime] = useState<string>('00:00:00');
  const [classSessionUploads] = useTable(tables.class_sessions_uploads);
  const indicatorsRef = useRef<HTMLDivElement>(null);

  // Update countdown timer
  useEffect(() => {
    if (!classSession) return;

    const updateTimer = () => {
      const remaining = Math.max(0, classSession.endTime - Date.now());
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
  }, [classSession]);

  // Auto-scroll to current question
  useEffect(() => {
    if (indicatorsRef.current) {
      const currentButton = indicatorsRef.current.querySelector(
        `.question-indicator:nth-child(${questionId + 1})`
      ) as HTMLElement;
      if (currentButton) {
        currentButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [questionId]);

  // Determine status for each question
  const getQuestionStatus = (idx: number) => {
    const upload = classSessionUploads.find(
      u => u.accessCode === accessCode && u.creatorNickname === nickname && u.plantAnswerType === plantTypes[idx]?.name
    );
    if (!upload) return 'unattempted'; // grey
    if (upload.plantAnswerType === upload.plantCorrectType) return 'correct'; // green
    return 'incorrect'; // red
  };

  const handlePrevQuestion = () => {
    if (questionId > 0) {
      setQuestionId(questionId - 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionId < plantTypes.length - 1) {
      setQuestionId(questionId + 1);
    }
  };

  return (
    <div className="guest-home-screen">
      <div className="guest-home-header">
        <div className="guest-home-info">
          <div className="guest-access-code">課程碼: {accessCode}</div>
          <div className="guest-countdown">{remainingTime}</div>
        </div>
      </div>

      <div className="question-selector">
        <button
          className="selector-btn"
          onClick={handlePrevQuestion}
          disabled={questionId === 0}
        >
          ←
        </button>

        <div className="question-indicators" ref={indicatorsRef}>
          {plantTypes.map((_, idx) => (
            <button
              key={idx}
              className={`question-indicator ${getQuestionStatus(idx)}`}
              onClick={() => setQuestionId(idx)}
              title={`題目 ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          className="selector-btn"
          onClick={handleNextQuestion}
          disabled={questionId === plantTypes.length - 1}
        >
          →
        </button>
      </div>

      <div className="question-number-display">
        第 {questionId + 1} / {plantTypes.length} 題
      </div>

      <GuestChallenge questionId={questionId} setQuestionId={setQuestionId} />
    </div>
  );
}

export default function GuestHome() {
  const { accessCode, nickname } = useGuestProfileContext();
  const [plantTypes, plantsReady] = useTable(tables.plant_types);
  const [sessions] = useTable(tables.class_sessions);
  const [questionId, setQuestionId] = useState(0);

  const currentSession = sessions.find(s => s.accessCode === accessCode);

  if (!plantsReady || !currentSession) {
    return (
      <div className="guest-home-container">
        <div className="screen-container">
          <div className="guest-loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">加載中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-home-container">
      <div className="screen-container">
        <GuestHomeScreen
          accessCode={accessCode}
          nickname={nickname}
          questionId={questionId}
          setQuestionId={setQuestionId}
          plantTypes={plantTypes}
          classSession={currentSession}
        />
      </div>
    </div>
  );
}
