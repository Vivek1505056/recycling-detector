import { useEffect, useRef, useState } from 'react';

import type { APIResponse } from '../types/api';
type Detection = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  confidence: number;
  is_recyclable: boolean;
  explanation: string;
};

type VideoStreamProps = {
  onResult: (result: APIResponse['result'] | null) => void;
};

export function VideoStream({ onResult }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const onResultRef = useRef(onResult);
  const clearDetectionTimeoutRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (active && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Failed to access camera.');
        console.error(err);
      }
    }

    startCamera();

    // Setup WebSocket
    const apiUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/stream/detect';
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setError(null);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = (e) => {
      console.error('WebSocket error', e);
      setError('Connection to backend stream failed.');
    };

    wsRef.current.onmessage = (event) => {
      if (!active) return;
      try {
        const data = JSON.parse(event.data);
        if (data.success && canvasRef.current && videoRef.current) {
          drawDetections(data.detections);
          
          if (data.detections && data.detections.length > 0) {
            if (clearDetectionTimeoutRef.current) {
              window.clearTimeout(clearDetectionTimeoutRef.current);
              clearDetectionTimeoutRef.current = null;
            }

            const det = data.detections[0];
            onResultRef.current({
              label: det.label,
              confidence: det.confidence,
              is_recyclable: det.is_recyclable,
              explanation: det.explanation ?? 'Live stream detection result.',
            });
          } else {
            if (!clearDetectionTimeoutRef.current) {
              clearDetectionTimeoutRef.current = window.setTimeout(() => {
                onResultRef.current(null);
                clearDetectionTimeoutRef.current = null;
              }, 1500);
            }
          }
        }
      } catch (err) {
        console.error('Error parsing detections', err);
      }
    };

    function drawDetections(detections: Detection[]) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ensure canvas matches video native size exactly
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach(det => {
        const { x1, y1, x2, y2, label, confidence, is_recyclable } = det;
        const color = is_recyclable ? '#22c55e' : '#ef4444'; // green or red
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const text = `${label} ${(confidence * 100).toFixed(1)}%`;
        ctx.fillStyle = color;
        ctx.font = 'bold 18px sans-serif';
        const textWidth = ctx.measureText(text).width;
        
        ctx.fillRect(x1, y1 - 28, textWidth + 12, 28);
        ctx.fillStyle = 'white';
        ctx.fillText(text, x1 + 6, y1 - 8);
      });
    }

    // Capture and send frames loop
    const captureCanvas = document.createElement('canvas');
    const captureCtx = captureCanvas.getContext('2d');
    
    let lastSendTime = 0;
    const sendInterval = 150; // target ~6 FPS

    function processFrame(time: number) {
      if (!active) return;
      
      const video = videoRef.current;
      const ws = wsRef.current;
      
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && ws && ws.readyState === WebSocket.OPEN) {
        if (time - lastSendTime > sendInterval) {
          captureCanvas.width = video.videoWidth;
          captureCanvas.height = video.videoHeight;
          captureCtx?.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
          
          captureCanvas.toBlob((blob) => {
            if (active && blob && ws.readyState === WebSocket.OPEN) {
              ws.send(blob);
              lastSendTime = performance.now();
            }
          }, 'image/jpeg', 0.6); // slight compression for speed
        }
      }
      
      animationFrameId = requestAnimationFrame(processFrame);
    }
    
    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      if (clearDetectionTimeoutRef.current) {
        window.clearTimeout(clearDetectionTimeoutRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      onResultRef.current(null);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-black shadow-sm flex items-center justify-center">
      {error ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 px-6 text-center text-sm text-rose-400">
          {error}
        </div>
      ) : null}
      
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        className="h-auto w-full object-contain max-h-[70vh]"
      />
      
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full object-contain pointer-events-none"
      />
      
      <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white shadow-sm flex items-center gap-2">
         <div className="h-2 w-2 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
         Live inference
      </div>
    </div>
  );
}
