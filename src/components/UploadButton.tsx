// src/components/UploadButton.tsx
"use client";

import { useRef } from "react";
import { Upload, Loader2, FolderOpen } from "lucide-react";
import { useUpload } from "@/hooks/useUpload"; // 훅 불러오기

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // 업로드 비서(Hook)를 부릅니다.
  const { uploadImages, isUploading } = useUpload();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFilesSelected = async (files: FileList | null, input?: HTMLInputElement | null) => {
    if (!files || files.length === 0) return;
    await uploadImages(files);
    // 입력값 초기화 (같은 폴더/파일을 다시 선택해도 onChange 뜨도록)
    if (input) input.value = "";
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFilesSelected(e.target.files, fileInputRef.current)}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        // @ts-expect-error - 비표준 속성(크롬 계열) 폴더 업로드
        webkitdirectory=""
        directory=""
        onChange={(e) => handleFilesSelected(e.target.files, folderInputRef.current)}
        accept="image/*"
        multiple
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
      <button
        onClick={handleFolderClick}
        disabled={isUploading}
        className="bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/15 transition-all ml-2 flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-sm border border-white/10"
        title="폴더 업로드 (크롬/엣지 권장)"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FolderOpen className="w-4 h-4" />
            <span>Folder</span>
          </>
        )}
      </button>
    </>
  );
}