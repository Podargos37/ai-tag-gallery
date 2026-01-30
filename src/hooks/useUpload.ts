// src/hooks/useUpload.ts
import { useState } from "react";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Next.js API Route 호출
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log(`업로드 성공! 태그: ${data.metadata?.tags?.join(", ")}`);

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

  return { uploadImage, isUploading };
}