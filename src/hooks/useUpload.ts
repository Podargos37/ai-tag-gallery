// src/hooks/useUpload.ts
import { useState } from "react";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files: File[] | FileList) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return false;

      for (const file of fileArray) {
        formData.append("files", file);
      }

      // Next.js API Route 호출
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const count = Array.isArray(data.metadata) ? data.metadata.length : 1;
      console.log(`업로드 성공! ${count}개`);

      // 성공 시 페이지를 새로고침하여 갤러리에 반영
      window.location.reload();
      return true;
    } catch (error) {
      console.error("업로드 에러:", error);
      alert("업로드 중 에러가 발생했습니다.");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading };
}