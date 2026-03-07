import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

type ImageUploadProps = {
  onFileReady: (file: File, previewUrl: string) => void;
};

export function ImageUpload({ onFileReady }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    onFileReady(file, nextPreviewUrl);
  }

  return (
    <section className="rounded-3xl border border-dashed border-stone-300 bg-white/80 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-ink">Upload image</h2>
      <p className="mt-2 text-sm text-stone-600">
        Choose a photo of an item to send to the detection API.
      </p>
      <label className="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border border-stone-300 bg-stone-50 px-4 py-10 text-sm text-stone-600 transition hover:bg-stone-100">
        <input
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          type="file"
        />
        Select an image
      </label>
    </section>
  );
}
