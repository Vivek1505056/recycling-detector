import { useState } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { DetectionResultCard } from './components/DetectionResultCard';
import { HomeIntro } from './components/HomeIntro';
import { ImagePreview } from './components/ImagePreview';
import { ImageUpload } from './components/ImageUpload';
import { VideoStream } from './components/VideoStream';
import { detectImage } from './lib/api';
import type { APIResponse } from './types/api';

type InputMode = 'camera' | 'upload' | 'stream' | null;

export default function App() {
  const [mode, setMode] = useState<InputMode>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<APIResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(file: File, nextPreviewUrl: string) {
    setPreviewUrl(nextPreviewUrl);
    setError(null);
    setIsLoading(true);

    try {
      const response = await detectImage(file);
      setResult(response.result);
    } catch (caughtError) {
      setResult(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong while analyzing the image.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setMode(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen px-4 py-10 text-brand-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <HomeIntro onSelectMode={(m) => {
          setMode(m);
          setPreviewUrl(null);
          setResult(null);
          setError(null);
        }} />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            {mode === 'camera' ? (
              <CameraCapture onCapture={handleAnalyze} />
            ) : null}

            {mode === 'upload' ? (
              <ImageUpload onFileReady={handleAnalyze} />
            ) : null}
            
            {mode === 'stream' ? (
              <VideoStream onResult={setResult} />
            ) : null}
          </div>

          <div className="space-y-6">
            {previewUrl && mode !== 'stream' ? <ImagePreview src={previewUrl} /> : null}

            {isLoading ? (
              <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 text-sm text-stone-600 shadow-sm">
                Sending image to backend...
              </div>
            ) : null}

            {error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
                {error}
              </div>
            ) : null}

            {result ? (
              <DetectionResultCard 
                onRetry={handleReset} 
                result={result} 
                hideRetry={mode === 'stream'}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
