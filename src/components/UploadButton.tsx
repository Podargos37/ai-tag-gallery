// src/components/UploadButton.tsx
"use client";

import { useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useUpload } from "@/hooks/useUpload"; // 훅 불러오기

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 업로드 비서(Hook)를 부릅니다.
  const { uploadImage, isUploading } = useUpload();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 비서에게 파일을 맡깁니다.
    await uploadImage(file);

    // 입력값 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-all ml-2 flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-sm"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </>
        )}
      </button>
    </>
  );
}