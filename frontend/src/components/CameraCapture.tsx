import { useEffect, useRef, useState } from 'react';
import { dataUrlToFile } from '../lib/image';

type CameraCaptureProps = {
  onCapture: (file: File, previewUrl: string) => void;
};

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch {
        setError('Unable to access the camera on this device/browser.');
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const file = dataUrlToFile(dataUrl, 'camera-capture.jpg');

    onCapture(file, dataUrl);
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-brand-ink">Use camera</h2>
          <p className="mt-2 text-sm text-stone-600">
            Capture a frame from your laptop or phone camera.
          </p>
        </div>
        <button
          className="rounded-full bg-brand-moss px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isCameraReady}
          onClick={handleCapture}
          type="button"
        >
          Capture
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-stone-950">
        <video
          autoPlay
          className="aspect-video w-full object-cover"
          muted
          playsInline
          ref={videoRef}
        />
      </div>

      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      <canvas className="hidden" ref={canvasRef} />
    </section>
  );
}

