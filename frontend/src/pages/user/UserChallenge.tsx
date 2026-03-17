import { useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables } from "../../module_bindings";
import { useState, useRef, useEffect } from "react";
import { Modal } from "../../components/Modal";
import './UserChallenge.css';

export function UserLoadingQuestion() {
  return (
    <div className="challenge-loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">加載中...</p>
    </div>
  );
}

export function UserChallengeQuestionCard({ plant_types, questionId, setQuestionId, setPage, xpBoostCount }: { plant_types: any, questionId: number, setQuestionId: any, setPage: any, xpBoostCount: number }) {
  const correctXp = xpBoostCount > 0 ? 10 : 5;
  const incorrectXp = xpBoostCount > 0 ? 2 : 1;

  return (
    <div className="challenge-question-screen">
      <div className="page-title">植物挑戰</div>

      <div className="challenge-question-card">
        <div className="plant-icon-large">{plant_types[questionId]?.icons}</div>
        <div className="current-challenge-label">當前挑戰</div>
        <div className="plant-type-title">{plant_types[questionId]?.name}</div>
        <p className="plant-description">{plant_types[questionId]?.description}</p>
      </div>

      <div className="challenge-rewards">
        <div className="reward-correct">
          <div className="reward-label-correct">答對獎勵</div>
          <div className="reward-value-correct">+{correctXp} XP{xpBoostCount > 0 ? ' ⚡' : ''}</div>
        </div>
        <div className="reward-divider"></div>
        <div className="reward-incorrect">
          <div className="reward-label-incorrect">答錯獎勵</div>
          <div className="reward-value-incorrect">+{incorrectXp} XP{xpBoostCount > 0 ? ' ⚡' : ''}</div>
        </div>
      </div>

      <div className="challenge-actions">
        <button className="btn btn-primary challenge-btn" onClick={() => { setPage('photo') }}>📷 拍照</button>
        <button className="btn btn-secondary challenge-btn" onClick={() => { setQuestionId(Math.floor(Math.random() * plant_types.length)) }}>跳過</button>
      </div>
    </div>
  );
}

export function UserChallengeCapturePhoto({ setPage, setReason, setPhotoBlob }: { setPage: any, setReason: any, setPhotoBlob: any }) {
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

        // Stop video stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());

        // Convert canvas to base64
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6);
        setCapturedPhoto(base64);
        stopCamera();
      }
    }
  }

  const handleSubmitPhoto = () => {
    setReason(reasonText.trim());
    setPhotoBlob(capturedPhoto);
    setPage('loading answer');
  }

  const handleCancelPhoto = () => {
    setCapturedPhoto(null);
    setReasonText('');
    // Restart camera
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
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  const [fileModal, setFileModal] = useState<{ type: 'error'; title: string; message: string } | null>(null);

  // ── 新增：處理選擇檔案 ────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 可選：檢查是不是圖片
    if (!file.type.startsWith('image/')) {
      setFileModal({
        type: 'error',
        title: '無效的檔案',
        message: '請選擇圖片檔案'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // 停止相機（如果有開啟）
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      setCapturedPhoto(dataUrl);

      // 清空 input，避免下次選同一張不觸發 onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  // 點擊「從相簿選擇」時觸發隱藏的 input
  const openPhotoFile = () => {
    fileInputRef.current?.click();
  };

  if (capturedPhoto) {
    return (
      <div className="camera-container">
        <img src={capturedPhoto} alt="captured" className="camera-feed" />

        <div className="photo-overlay">
          <div className="reason-form-modal">
            <label className="reason-label">拍攝說明</label>
            <textarea
              className="reason-textarea"
              placeholder="描述你發現的植物或拍攝環境..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          </div>

          <div className="photo-controls">
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
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="camera-feed"
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="camera-controls">
        <button className="btn btn-primary" onClick={capturePhoto}>📷 拍照</button>
        <button className="btn btn-secondary" onClick={openPhotoFile}>🖼️ 相簿</button>
        <button className="btn btn-cancel" onClick={() => { stopCamera(); setPage('question'); }}>✕ 取消</button>
      </div>
      <canvas ref={canvasRef} hidden />

      {fileModal && (
        <Modal
          type={fileModal.type}
          title={fileModal.title}
          message={fileModal.message}
          onConfirm={() => setFileModal(null)}
        />
      )}
    </div>
  );
}


export function UserChallengeLoadingAnswer({ plantAnswerType, reason, photoBlob, setAIResponse, setPage }: { plantAnswerType: string, reason: string, photoBlob: string, setAIResponse: any, setPage: any }) {
  const { getConnection } = useSpacetimeDB();
  const [aiModal, setAiModal] = useState<{ type: 'error' | 'warning'; title: string; message: string } | null>(null);

  useEffect(() => {
    const conn = getConnection();
    // const blob = photoBlob.split(',')[1];
    if (conn) {
      conn.procedures.userCallAiModel({
        plantAnswerType,
        reason: reason.trim(),
        photoBlob,
      }).then(response => {
        console.log('AI response received:', response);
        if (response) {
          setAIResponse(response);
          setPage('answer');
        } else {
          setAiModal({
            type: 'warning',
            title: '無法辨識',
            message: '無法識別圖片中的植物，請重新嘗試'
          });
          setTimeout(() => setPage('question'), 2000);
        }
      })
        .catch(err => {
          console.error(`error when calling AI:`, err);
          setAiModal({
            type: 'error',
            title: '發生錯誤',
            message: String(err)
          });
          setTimeout(() => setPage('question'), 2000);
        })
    }
  }, []);


  return (
    <div className="challenge-loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">AI 分析中...</p>
      {aiModal && (
        <Modal
          type={aiModal.type}
          title={aiModal.title}
          message={aiModal.message}
          onConfirm={() => {
            setAiModal(null);
            setPage('question');
          }}
        />
      )}
    </div>
  );
}


export function UserChallengeAnswer({ plant_types, questionId, aiResponse, photoBlob, setPage, xpBoostCount }: { plant_types: any, questionId: number, aiResponse: any, photoBlob: string | undefined, setPage: any, xpBoostCount: number }) {
  const {
    isPlant,
    plantCorrectName,
    plantCorrectScientificName,
    plantCorrectType,
    plantCorrectFunFact
  } = aiResponse;
  const correctXp = xpBoostCount > 0 ? 10 : 5;
  const incorrectXp = xpBoostCount > 0 ? 2 : 1;
  console.log(`plant_types`, plant_types);
  const correct = (plant_types[questionId].name === plantCorrectType);

  if(!isPlant){
    return (
      <div className="result-screen">
        <div className="result-emoji">🤔</div>
        <div className="result-title">這不是植物呢</div>
        <p className="result-message">無法識別圖片中的植物，請重新嘗試</p>
        <button className="btn btn-primary result-btn" onClick={()=>{setPage('question')}}>再試一次</button>
      </div>
    )
  }

  return (
    <div className="result-screen">
      <h2 className="result-page-title">挑戰結果</h2>

      <img src={photoBlob} alt="植物圖片" className="result-image" />

      {correct ? (
        <div className="result-status result-status-correct">
          <div className="result-emoji">🎉</div>
          <div className="result-status-title">答對了！</div>
          <p className="result-xp-text">獲得 <b>{correctXp} 點經驗值</b></p>
        </div>
      ) : (
        <div className="result-status result-status-incorrect">
          <div className="result-emoji">🤔</div>
          <div className="result-status-title">答錯了！</div>
          <p className="result-xp-text">獲得 <b>{incorrectXp} 點經驗值</b></p>
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
        <p className="hint-content">{correct ? plant_types[questionId].extras : plant_types[questionId].hints}</p>
      </div>

      <button className="btn btn-primary result-continue-btn" onClick={()=>{setPage('question')}}>{correct ? '下一題 →' : '下一題 →'}</button>
    </div>
  );
}

export function UserChallenge() {
  // draw a random question from DB
  const [plant_types, questionReady] = useTable(tables.plant_types);
  const [my_profile] = useTable(tables.get_user_profile);
  const [questionId, setQuestionId] = useState(0);
  const [page, setPage] = useState('question'); // question / photo / loading answer / answer / loading question

  const [photoBlob, setPhotoBlob] = useState<string | undefined>(undefined);
  const [reason, setReason] = useState<string | undefined>(undefined);

  const [aiResponse, setAIResponse] = useState<any>(undefined);

  const profile = my_profile[0];
  const xpBoostCount = profile?.xpBoostCount || 0;

  // click take photo or pick photo

  // loading screen


  // answer screen


  // correct --> extra , error --> hint

  if (page === 'question' && !questionReady) {
    return <UserLoadingQuestion />;
  } else if (page === 'question' && questionReady) {
    return <UserChallengeQuestionCard
      plant_types={plant_types}
      questionId={questionId}
      setQuestionId={setQuestionId}
      setPage={setPage}
      xpBoostCount={xpBoostCount} />
  } else if (page === 'photo') {
    return <UserChallengeCapturePhoto
      setPage={setPage}
      setPhotoBlob={setPhotoBlob}
      setReason={setReason} />
  } else if (page === 'loading answer') {
    return <UserChallengeLoadingAnswer
      plantAnswerType={plant_types[questionId].name}
      reason={reason || ""}
      photoBlob={photoBlob!}
      setAIResponse={setAIResponse}
      setPage={setPage} />
  } else if (page === 'answer') {
    return <UserChallengeAnswer
      plant_types={plant_types} 
      questionId={questionId}
      aiResponse={aiResponse} 
      photoBlob={photoBlob}
      setPage={setPage}
      xpBoostCount={xpBoostCount}
      />
  }
}