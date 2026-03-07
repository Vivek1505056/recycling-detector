type ImagePreviewProps = {
  src: string;
};

export function ImagePreview({ src }: ImagePreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
      <img
        alt="Selected item preview"
        className="h-64 w-full object-cover"
        src={src}
      />
    </div>
  );
}

