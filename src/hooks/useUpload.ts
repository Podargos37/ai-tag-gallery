// src/hooks/useUpload.ts
import { useState } from "react";

type UploadPhase = "idle" | "uploading" | "processing";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState<number | null>(null); // 0-100, null이면 측정 불가
  const [totalFiles, setTotalFiles] = useState(0);

  const uploadImages = async (files: File[] | FileList) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return false;
      setTotalFiles(fileArray.length);
      setPhase("uploading");
      setProgress(null);

      for (const file of fileArray) {
        formData.append("files", file);
      }

      const uploadId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      let polling = true;
      const poll = async () => {
        while (polling) {
          try {
            const res = await fetch(`/api/upload/progress?id=${encodeURIComponent(uploadId)}`, {
              cache: "no-store",
            });
            if (res.ok) {
              const p = await res.json();
              if (p?.status === "processing" || p?.status === "done") setPhase("processing");
              if (typeof p?.total === "number") setTotalFiles(p.total);
              if (typeof p?.processed === "number" && typeof p?.total === "number" && p.total > 0) {
                setProgress(Math.round((p.processed / p.total) * 100));
              }
              if (p?.status === "done") break;
              if (p?.status === "error") break;
            }
          } catch {
            // 폴링 실패는 무시(네트워크 순간 문제 등)
          }
          await new Promise((r) => setTimeout(r, 400));
        }
      };
      poll();

      // 업로드/처리 요청은 fetch로 유지
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-upload-id": uploadId,
          "x-total-files": String(fileArray.length),
        },
        body: formData,
      });

      polling = false;
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPhase("processing");
      setProgress(100);

      const count = Array.isArray(data?.metadata) ? data.metadata.length : 1;
      console.log(`업로드 성공! ${count}개`);

      // 성공 시 페이지를 새로고침하여 갤러리에 반영
      window.location.reload();
      return true;
    } catch (error) {
      console.error("업로드 에러:", error);
      alert("업로드 중 에러가 발생했습니다.");
      return false;
    } finally {
      setPhase("idle");
      setProgress(null);
      setTotalFiles(0);
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading, phase, progress, totalFiles };
}