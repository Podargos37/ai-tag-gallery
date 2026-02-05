import { useState } from "react";
import { getUploadProgress, uploadFiles } from "@/lib/api";

type UploadPhase = "idle" | "uploading" | "processing";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [totalFiles, setTotalFiles] = useState(0);

  const uploadImages = async (files: File[] | FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return false;

    setIsUploading(true);
    setTotalFiles(fileArray.length);
    setPhase("uploading");
    setProgress(null);

    const uploadId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    let polling = true;
    const poll = async () => {
      while (polling) {
        try {
          const p = await getUploadProgress(uploadId);
          if (p) {
            if (p.status === "processing" || p.status === "done") setPhase("processing");
            if (typeof p.total === "number") setTotalFiles(p.total);
            if (typeof p.processed === "number" && typeof p.total === "number" && p.total > 0) {
              setProgress(Math.round((p.processed / p.total) * 100));
            }
            if (p.status === "done" || p.status === "error") break;
          }
        } catch {
          // 폴링 실패 무시
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    };
    poll();

    try {
      const data = await uploadFiles(files, uploadId);
      polling = false;
      setPhase("processing");
      setProgress(100);

      const count = Array.isArray(data?.metadata) ? data.metadata.length : 1;
      console.log(`업로드 성공! ${count}개`);

      window.location.reload();
      return true;
    } catch (error) {
      console.error("업로드 에러:", error);
      alert("업로드 중 에러가 발생했습니다.");
      return false;
    } finally {
      polling = false;
      setPhase("idle");
      setProgress(null);
      setTotalFiles(0);
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading, phase, progress, totalFiles };
}