import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "../../module_bindings";
import { useState, useRef, useEffect } from "react";

export function UserLoadingQuestion() {
  return (
    <div>
      <div> 植物挑戰 </div>
      <div>
        <div> 加載中... </div>
      </div>
    </div>
  );
}

export function UserChallengeQuestionCard({ plant_types, questionId, setQuestionId, setPage }: { plant_types: any, questionId: number, setQuestionId: any, setPage: any }) {
  return (
    <div>
      <div> 植物挑戰 </div>
      <div>
        <div> {plant_types[questionId]?.icons} </div>
        <div> {plant_types[questionId]?.name} </div>
        <div> {plant_types[questionId]?.description} </div>
      </div>
      <div>
        <div>
          <div>答對獎勵</div>
          <div>+5 XP</div>
        </div>
        <div>
          <div>答錯獎勵</div>
          <div>+1 XP</div>
        </div>
      </div>
      <div>
        <button onClick={() => { setPage('photo') }}>📷 拍照</button>
        <button onClick={() => { setQuestionId(Math.floor(Math.random() * plant_types.length)) }}>跳過</button>
        {/* <button>🖼️ 相簿</button> */}
      </div>
    </div>
  );
}

export function UserChallengeCapturePhoto({ setPage, setReason, setPhotoBlob }: { setPage: any, setReason: any, setPhotoBlob: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoStream, setStream] = useState<MediaStream | null>(null);

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
        setPhotoBlob(base64);
        // console.log(base64.substring(0,20));
        stopCamera();
        setPage('loading answer');
      }
    }
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  // ── 新增：處理選擇檔案 ────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 可選：檢查是不是圖片
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const base64Data = dataUrl;

      // 停止相機（如果有開啟）
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      setPhotoBlob(base64Data);
      setPage('loading answer');

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

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: 'block', width: '100%', maxWidth: '500px', marginTop: '10px' }}
      />

      <label> Reason: </label><input onChange={(e) => { setReason(e.target.value) }} />
      {/* 隱藏的檔案輸入框 */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div>
        <button onClick={capturePhoto}> 拍照 </button>
        <button onClick={openPhotoFile}>🖼️ 從相簿選擇</button>
        <button onClick={() => { stopCamera(); setPage('question'); }}> 取消 </button>
      </div>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}


export function UserChallengeLoadingAnswer({ plantAnswerType, reason, photoBlob, setAIResponse, setPage }: { plantAnswerType: string, reason: string, photoBlob: string, setAIResponse: any, setPage: any }) {
  const { getConnection } = useSpacetimeDB();

  useEffect(() => {
    const conn = getConnection();
    // const blob = photoBlob.split(',')[1];
    if (conn) {
      conn.procedures.userCallAiModel({
        plantAnswerType,
        reason: reason.trim(),
        photoBlob,
      }).then(response => {
        if (response) {
          setAIResponse(response);
        }
        setPage('answer')
      })
        .catch(err => {
          console.log(`error when calling AI: ${err}`);
        })
    }
  }, []);


  return (
    <div>
      loading
    </div>
  );
}


export function UserChallengeAnswer({ plant_types, questionId, aiResponse, photoBlob, setPage }: { plant_types: any, questionId: number, aiResponse: any, photoBlob: string | undefined, setPage: any }) {
  const {
    isPlant,
    plantCorrectName,
    plantCorrectScientificName,
    plantCorrectType,
    plantCorrectFunFact
  } = aiResponse;

  console.log(`plant_types`, plant_types);
  const correct = (plant_types[questionId].name === plantCorrectType);

  if(!isPlant){
    return (
      <div>
          <div>🤔</div>
          <div>這不是植物來哦！</div>
          <button onClick={()=>{setPage('question')}}>再試一次</button>
      </div>
    )
  }

  return (
    <div>
      <h2>挑戰結果</h2>
      <img src={photoBlob} alt="植物圖片" />
      {JSON.stringify(aiResponse)}
      {(correct && (
        <div>
          <div>🎉</div>
          <div>答對了！</div>
          <div>獲得 5 點經驗值</div>
        </div>
      )) || (
        <div>
          <div>🤔</div>
          <div>答錯了！</div>
          <div>獲得 1 點經驗值</div>
        </div>
      )}
      <div>
        <div>{plantCorrectName}</div>
        <div>{plantCorrectScientificName}</div>
        <div>{plantCorrectFunFact}</div>
      </div>
      <div>
        <div>💡 提示</div>
        <div> {(correct && plant_types[questionId].extra) || plant_types[questionId].hints} </div>
      </div>
      <button onClick={()=>{setPage('question')}}>再試一次</button>
    </div>
  );
}

export function UserChallenge() {
  // draw a random question from DB
  const [plant_types, questionReady] = useTable(tables.plant_types);
  const [questionId, setQuestionId] = useState(0);
  const [page, setPage] = useState('question'); // question / photo / loading answer / answer / loading question

  const [photoBlob, setPhotoBlob] = useState<string | undefined>(undefined);
  const [reason, setReason] = useState<string | undefined>(undefined);

  const [aiResponse, setAIResponse] = useState<any>(undefined);

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
      setPage={setPage} />
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
      />
  }
}