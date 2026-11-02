import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  onImageCleared?: () => void;
  maxSizeMb?: number;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onImageCleared,
  maxSizeMb = 10,
  label = "Upload Inspection Image",
  helperText = "Supports JPEG, PNG, or WebP up to 10MB"
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeMb, setFileSizeMb] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}. Please upload a JPEG, PNG, or WebP.`);
      return;
    }

    // Validate size
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > maxSizeMb) {
      setError(`File is too large (${sizeInMb.toFixed(1)} MB). Limit is ${maxSizeMb} MB.`);
      return;
    }

    setFileName(file.name);
    setFileSizeMb(sizeInMb.toFixed(2));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setPreview(null);
    setFileName('');
    setFileSizeMb('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onImageCleared) onImageCleared();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        {label}
      </label>

      {error && (
        <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-construction-500 bg-construction-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-construction-400 bg-white hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500 group-hover:text-construction-600">
            <UploadCloud className="w-7 h-7 text-construction-500" />
          </div>

          <p className="text-sm font-medium text-slate-700 mb-1">
            <span className="text-construction-600 font-semibold hover:underline">
              Click to browse
            </span>{' '}
            or drag and drop photo here
          </p>
          <p className="text-xs text-slate-500">{helperText}</p>
        </div>
      ) : (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group">
          <img
            src={preview}
            alt="Upload Preview"
            className="w-full h-64 object-contain mx-auto bg-slate-950/40"
          />

          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <button
              onClick={handleClear}
              type="button"
              className="p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors shadow-lg backdrop-blur-sm"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate">
              <ImageIcon className="w-4 h-4 text-construction-400" />
              <span className="font-medium truncate">{fileName}</span>
            </div>
            <span className="text-slate-300 ml-2 whitespace-nowrap">{fileSizeMb} MB</span>
          </div>
        </div>
      )}
    </div>
  );
};
