"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Next.js 서버로 이미지 전송
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      const tags = data.metadata?.tags || [];
      console.log("서버 응답 데이터:", data);

      console.log(`업로드 성공! 분석된 태그: ${tags.join(", ")}`);

      // 페이지 새로고침하여 갤러리에 즉시 반영
      window.location.reload();

    } catch (error) {
      console.error("업로드 에러 상세:", error);
      alert("업로드 중 에러가 발생했습니다. 콘솔을 확인하세요.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-all ml-2 flex items-center gap-2 disabled:opacity-50 active:scale-95"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
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