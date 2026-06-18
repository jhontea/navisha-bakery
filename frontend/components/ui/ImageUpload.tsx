"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  value?: string;
  onChange?: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onUpload, value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload JPEG, PNG, or WebP.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large. Maximum size is 5MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange?.(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-outline-variant">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-surface-container-low transition-all"
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-on-surface-variant">Uploading...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                cloud_upload
              </span>
              <span className="text-sm text-on-surface-variant">Click to upload image</span>
              <span className="text-xs text-on-surface-variant opacity-60">
                JPEG, PNG, WebP (max 5MB)
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}