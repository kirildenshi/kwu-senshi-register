'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FileInputProps {
  id: string;
  accept?: string;
  onChange: (file: File | null) => void;
  error?: boolean;
  'aria-describedby'?: string;
  /** Overrides the default 5MB max (and adds a floor — no minimum by default). */
  minSizeMB?: number;
  maxSizeMB?: number;
  labels?: {
    upload_image?: string;
    upload_file?: string;
    unsupported_type?: string;
    too_large?: string;
    too_small?: string;
    min_dimensions?: string;
  };
}

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_IMAGE_DIM = 400;

export default function FileInput({
  id,
  accept,
  onChange,
  error,
  minSizeMB,
  maxSizeMB,
  labels,
  ...ariaProps
}: FileInputProps) {
  const minFileSize = minSizeMB ? minSizeMB * 1024 * 1024 : 0;
  const maxFileSize = maxSizeMB ? maxSizeMB * 1024 * 1024 : DEFAULT_MAX_FILE_SIZE;
  const ta = useTranslations('common.aria');
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImageAccept = accept?.includes('image');

  const validateAndSetFile = useCallback(
    async (file: File) => {
      setFileError(null);

      // Type validation
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const isAccepted = acceptedTypes.some((t) => {
          if (t === 'image/*') return file.type.startsWith('image/');
          if (t.startsWith('.')) return file.name.toLowerCase().endsWith(t);
          return file.type === t;
        });
        if (!isAccepted) {
          setFileError(labels?.unsupported_type ?? 'Unsupported file type');
          return;
        }
      }

      // Size validation
      if (file.size > maxFileSize) {
        setFileError(labels?.too_large ?? 'File must be under 5 MB');
        return;
      }
      if (minFileSize > 0 && file.size < minFileSize) {
        setFileError(labels?.too_small ?? 'File is too small');
        return;
      }

      // Image dimension validation
      if (file.type.startsWith('image/')) {
        const valid = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img.width >= MIN_IMAGE_DIM && img.height >= MIN_IMAGE_DIM);
          };
          img.onerror = () => {
            URL.revokeObjectURL(img.src);
            resolve(false);
          };
          img.src = URL.createObjectURL(file);
        });
        if (!valid) {
          setFileError(
            (labels?.min_dimensions ?? 'Image must be at least {dim}x{dim} pixels').replace(
              /\{dim\}/g,
              String(MIN_IMAGE_DIM),
            ),
          );
          return;
        }
        setPreview(URL.createObjectURL(file));
      }

      setFileName(file.name);
      onChange(file);
    },
    [accept, onChange, labels, minFileSize, maxFileSize],
  );

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    setFileError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-senshi-sm border-2 border-dashed p-4 text-center transition-colors ${
          error || fileError
            ? 'border-red-500'
            : isDragging
              ? 'border-senshi-gold-70 bg-senshi-gold-90/5'
              : 'border-senshi-black-25 hover:border-senshi-grey-60'
        }`}
      >
        {preview ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-16 w-16 rounded object-cover"
            />
            <span className="flex-1 truncate text-sm text-senshi-grey-70">
              {fileName}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-senshi-grey-60 hover:text-red-400"
              aria-label={ta('remove_file')}
            >
              <X size={18} />
            </button>
          </div>
        ) : fileName ? (
          <div className="flex items-center gap-3">
            <span className="flex-1 truncate text-sm text-senshi-grey-70">
              {fileName}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-senshi-grey-60 hover:text-red-400"
              aria-label={ta('remove_file')}
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 py-2 text-senshi-grey-60"
          >
            <Upload size={24} />
            <span className="text-sm">
              {isImageAccept
                ? (labels?.upload_image ?? 'Drag & drop or click to upload image')
                : (labels?.upload_file ?? 'Drag & drop or click to upload file')}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndSetFile(file);
          }}
          className="sr-only"
          tabIndex={-1}
          {...ariaProps}
        />
      </div>
      {fileError && (
        <p role="alert" className="mt-1 text-sm text-red-400">
          {fileError}
        </p>
      )}
    </div>
  );
}
