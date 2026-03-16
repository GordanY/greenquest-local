import { useState, useRef, useEffect } from 'react';
import { useSpacetimeDB, useTable } from 'spacetimedb/react';
import { tables } from '../../module_bindings';
import { useGuestProfileContext } from './GuestProfileProvider';

export default function GuestHome() {
  const { getConnection } = useSpacetimeDB();
  const [plantTypes] = useTable(tables.plant_types);
  const { accessCode, nickname } = useGuestProfileContext();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [reason, setReason] = useState('');
  const [photoBlob, setPhotoBlob] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const savedIndex = sessionStorage.getItem('guest_current_question');
    if (savedIndex && plantTypes && plantTypes.length > 0) {
      setCurrentQuestion(parseInt(savedIndex, 10));
    } else if (plantTypes && plantTypes.length > 0) {
      const randomIndex = Math.floor(Math.random() * plantTypes.length);
      setCurrentQuestion(randomIndex);
      sessionStorage.setItem('guest_current_question', randomIndex.toString());
    }
  }, [plantTypes]);

  const currentPlantType = plantTypes && plantTypes.length > 0 && plantTypes[currentQuestion]
    ? plantTypes[currentQuestion]
    : null;

  const handleNextQuestion = () => {
    if (!plantTypes || plantTypes.length === 0) return;
    const nextIndex = (currentQuestion + 1) % plantTypes.length;
    setCurrentQuestion(nextIndex);
    sessionStorage.setItem('guest_current_question', nextIndex.toString());
    setReason('');
    setPhotoBlob(null);
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!photoBlob || !currentPlantType || !reason.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const conn = getConnection();
      if (!conn) {
        alert('Connection not ready');
        return;
      }

      const photoData = photoBlob.split(',')[1];

      const response = await conn.procedures.guestCallAiModel({
        accessCode: accessCode,
        nickname: nickname,
        plantAnswerType: currentPlantType.name,
        reason: reason.trim(),
        photoBlob: photoData,
      });

      console.log(JSON.stringify(response, null, 2))

      setSubmitted(true);
      // setIsSubmitting(false);
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  const openCamera = async () => {
    try {
      // Try to open back camera first
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }
        }
      };
      let stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log('Back camera failed, trying front camera:', err);
      try {
        // Fallback to front camera
        const constraints = {
          video: {
            facingMode: 'user'
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Failed to access camera:', error);
        alert('Unable to access camera');
      }
    }
  };

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
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Plant Guessing Game</h1>
      
      {!currentPlantType ? (
        <p>Loading questions...</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
            <h2>Question {currentQuestion + 1}</h2>
            <p style={{ fontSize: '18px' }}>Is this plant a <strong>{currentPlantType.name}</strong>?</p>
            {currentPlantType.description && (
              <p style={{ fontSize: '14px', color: '#666' }}>Hint: {currentPlantType.description}</p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Take a photo of the plant:
            </label>
            <button onClick={openCamera} style={{ marginRight: '10px', padding: '10px 20px' }}>
              Open Camera
            </button>
            <button onClick={capturePhoto} style={{ padding: '10px 20px' }}>
              Take Photo
            </button>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ display: photoBlob ? 'none' : 'block', width: '100%', maxWidth: '500px', marginTop: '10px' }}
            />

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {photoBlob && (
              <div style={{ marginTop: '10px' }}>
                <img src={photoBlob} alt="Captured" style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }} />
                <button onClick={() => setPhotoBlob(null)} style={{ marginTop: '10px', padding: '8px 16px' }}>
                  Clear Photo
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Explain your reasoning:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Why do you think this plant is or is not a ${currentPlantType.name}?`}
              style={{ width: '100%', height: '100px', padding: '10px', fontSize: '16px' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!photoBlob || !reason.trim() || isSubmitting || submitted}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: submitted ? '#4CAF50' : (!photoBlob || !reason.trim() ? '#ccc' : '#2196F3'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (!photoBlob || !reason.trim() || submitted) ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Submitting...' : submitted ? 'Submitted! Next question coming...' : 'Submit'}
          </button>
        </>
      )}
    </div>
  );
}
