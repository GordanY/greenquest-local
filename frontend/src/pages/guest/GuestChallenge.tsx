import { useState, useRef, useEffect } from 'react';
import { useSpacetimeDB, useTable } from 'spacetimedb/react';
import { tables } from '../../module_bindings';
import { useGuestProfileContext } from './GuestProfileProvider';
import './GuestChallenge.css';

export function GuestLoadingQuestion() {
  return (
    <div className="guest-challenge-loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">加載中...</p>
    </div>
  );
}

export function GuestChallengeQuestionCard({
  plantTypes,
  questionId,
  setQuestionId,
  setPage,
  classSessionUploads,
  accessCode,
  nickname
}: {
  plantTypes: any;
  questionId: number;
  setQuestionId: (id: number) => void;
  setPage: (page: string) => void;
  classSessionUploads: readonly any[];
  accessCode: string;
  nickname: string;
}) {
  const currentPlantType = plantTypes[questionId]?.name;

  // Check if already answered
  const hasAnswered = classSessionUploads.some(upload =>
    upload.accessCode === accessCode &&
    upload.creatorNickname === nickname &&
    upload.plantAnswerType === currentPlantType
  );

  const handleSkip = () => {
    if (questionId < plantTypes.length - 1) {
      setQuestionId(questionId + 1);
    }
  };

  return (
    <div className="guest-challenge-question-screen">
      <div className="guest-challenge-title">植物挑戰</div>

      <div className="guest-challenge-question-card">
        <div className="guest-plant-icon-large">{plantTypes[questionId]?.icons}</div>
        <div className="guest-current-challenge-label">當前挑戰</div>
        <div className="guest-plant-type-title">{plantTypes[questionId]?.name}</div>
        <p className="guest-plant-description">{plantTypes[questionId]?.description}</p>
        {hasAnswered && <div className="already-answered-badge">✓ 已回答</div>}
      </div>

      <div className="guest-challenge-actions">
        <button
          className="btn btn-primary guest-challenge-btn"
          onClick={() => setPage('photo')}
          disabled={hasAnswered}
          title={hasAnswered ? '已經回答過此題' : ''}
        >
          📷 拍照
        </button>
        <button
          className="btn btn-secondary guest-challenge-btn"
          onClick={handleSkip}
          disabled={questionId === plantTypes.length - 1}
        >
          跳過
        </button>
      </div>
    </div>
  );
}

export function GuestChallengeCapturePhoto({
  setPage,
  setReason,
  setPhotoBlob
}: {
  setPage: (page: string) => void;
  setReason: (reason: string) => void;
  setPhotoBlob: (blob: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoStream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState<string>('');

  useEffect(() => {
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' }
      }
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        console.log(`opened camera`);
      })
      .catch(err => {
        console.log(`error when opening back camera: ${err}`);
      });
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());

        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6);
        setCapturedPhoto(base64);
        stopCamera();
      }
    }
  };

  const handleSubmitPhoto = () => {
    setReason(reasonText.trim());
    setPhotoBlob(capturedPhoto!);
    setPage('loading answer');
  };

  const handleCancelPhoto = () => {
    setCapturedPhoto(null);
    setReasonText('');
    const constraints = {
      video: { facingMode: { ideal: 'environment' } }
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.log(`error when reopening camera: ${err}`);
      });
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      setCapturedPhoto(dataUrl);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const openPhotoFile = () => {
    fileInputRef.current?.click();
  };

  if (capturedPhoto) {
    return (
      <div className="guest-camera-container">
        <img src={capturedPhoto} alt="captured" className="guest-camera-feed" />

        <div className="guest-photo-overlay">
          <div className="guest-reason-form-modal">
            <label className="guest-reason-label">拍攝說明</label>
            <textarea
              className="guest-reason-textarea"
              placeholder="描述你發現的植物或拍攝環境..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          </div>

          <div className="guest-photo-controls">
            <button className="btn btn-primary" onClick={handleSubmitPhoto}>✓ 提交</button>
            <button className="btn btn-secondary" onClick={handleCancelPhoto}>↻ 重新拍攝</button>
            <button className="btn btn-cancel" onClick={() => { setPage('question'); }}>✕ 取消</button>
          </div>
        </div>
        <canvas ref={canvasRef} hidden />
      </div>
    );
  }

  return (
    <div className="guest-camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="guest-camera-feed"
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="guest-camera-controls">
        <button className="btn btn-primary" onClick={capturePhoto}>📷 拍照</button>
        <button className="btn btn-secondary" onClick={openPhotoFile}>🖼️ 相簿</button>
        <button className="btn btn-cancel" onClick={() => { stopCamera(); setPage('question'); }}>✕ 取消</button>
      </div>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}

export function GuestChallengeLoadingAnswer({
  plantAnswerType,
  reason,
  photoBlob,
  setAIResponse,
  setPage,
  accessCode,
  nickname
}: {
  plantAnswerType: string;
  reason: string;
  photoBlob: string;
  setAIResponse: (response: any) => void;
  setPage: (page: string) => void;
  accessCode: string;
  nickname: string;
}) {
  const { getConnection } = useSpacetimeDB();

  useEffect(() => {
    const conn = getConnection();
    if (conn) {
      conn.procedures.guestCallAiModel({
        accessCode,
        nickname,
        plantAnswerType,
        reason: reason.trim(),
        photoBlob
      })
        .then(response => {
          console.log('AI response received:', response);
          if (response) {
            setAIResponse(response);
            setPage('answer');
          } else {
            alert('Failed to get AI response. Please try again.');
            setPage('question');
          }
        })
        .catch(err => {
          console.error(`error when calling AI:`, err);
          alert(`Error: ${String(err)}`);
        });
    }
  }, []);

  return (
    <div className="guest-challenge-loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">AI 分析中...</p>
    </div>
  );
}

export function GuestChallengeAnswer({
  plantTypes,
  questionId,
  aiResponse,
  photoBlob,
  setPage
}: {
  plantTypes: any;
  questionId: number;
  aiResponse: any;
  photoBlob: string | undefined;
  setPage: (page: string) => void;
}) {
  const { isPlant, plantCorrectName, plantCorrectScientificName, plantCorrectType, plantCorrectFunFact } = aiResponse;
  const correct = plantTypes[questionId]?.name === plantCorrectType;

  if (!isPlant) {
    return (
      <div className="result-screen">
        <div className="result-emoji">🤔</div>
        <div className="result-title">這不是植物呢</div>
        <p className="result-message">無法識別圖片中的植物，請重新嘗試</p>
        <button className="btn btn-primary result-btn" onClick={() => { setPage('question'); }}>再試一次</button>
      </div>
    );
  }

  return (
    <div className="result-screen">
      {/* <h2 className="result-page-title">挑戰結果</h2> */}

      <img src={photoBlob} alt="植物圖片" className="result-image" />

      {correct ? (
        <div className="result-status result-status-correct">
          <div className="result-emoji">🎉</div>
          <div className="result-status-title">答對了！</div>
        </div>
      ) : (
        <div className="result-status result-status-incorrect">
          <div className="result-emoji">🤔</div>
          <div className="result-status-title">答錯了！</div>
        </div>
      )}

      {plantCorrectName && (
        <div className="result-plant-info">
          <p className="plant-info-name">{plantCorrectName}</p>
          {plantCorrectScientificName && (
            <p className="plant-info-scientific">{plantCorrectScientificName}</p>
          )}
          {plantCorrectFunFact && (
            <p className="plant-info-funfact">{plantCorrectFunFact}</p>
          )}
        </div>
      )}

      <div className="hint-box">
        <p className="hint-title">{correct ? '💡 延伸知識' : '💡 提示'}</p>
        <p className="hint-content">{correct ? plantTypes[questionId]?.extras : plantTypes[questionId]?.hints}</p>
      </div>

      <button className="btn btn-primary result-continue-btn" onClick={() => { setPage('question'); }}>{'下一題 →'}</button>
    </div>
  );
}

export function GuestChallenge({
  questionId,
  setQuestionId
}: {
  questionId: number;
  setQuestionId: (id: number) => void;
}) {
  const [plantTypes, questionReady] = useTable(tables.plant_types);
  const [classSessionUploads] = useTable(tables.class_sessions_uploads);
  const [page, setPage] = useState('question'); // question / photo / loading answer / answer
  const [photoBlob, setPhotoBlob] = useState<string | undefined>(undefined);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [aiResponse, setAIResponse] = useState<any>(undefined);
  const { accessCode, nickname } = useGuestProfileContext();

  if (page === 'question' && !questionReady) {
    return <GuestLoadingQuestion />;
  } else if (page === 'question' && questionReady) {
    return (
      <GuestChallengeQuestionCard
        plantTypes={plantTypes}
        questionId={questionId}
        setQuestionId={setQuestionId}
        setPage={setPage}
        classSessionUploads={classSessionUploads}
        accessCode={accessCode}
        nickname={nickname}
      />
    );
  } else if (page === 'photo') {
    return (
      <GuestChallengeCapturePhoto
        setPage={setPage}
        setReason={setReason}
        setPhotoBlob={setPhotoBlob}
      />
    );
  } else if (page === 'loading answer') {
    return (
      <GuestChallengeLoadingAnswer
        plantAnswerType={plantTypes[questionId]?.name}
        reason={reason || ''}
        photoBlob={photoBlob || ''}
        setAIResponse={setAIResponse}
        setPage={setPage}
        accessCode={accessCode}
        nickname={nickname}
      />
    );
  } else if (page === 'answer') {
    return (
      <GuestChallengeAnswer
        plantTypes={plantTypes}
        questionId={questionId}
        aiResponse={aiResponse}
        photoBlob={photoBlob}
        setPage={setPage}
      />
    );
  }

  return null;
}
