export type UploadProgressResponse = {
  status: string;
  total?: number;
  processed?: number;
  updatedAt?: number;
};

export async function getUploadProgress(uploadId: string): Promise<UploadProgressResponse | null> {
  const res = await fetch(`/api/upload/progress?id=${encodeURIComponent(uploadId)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export type UploadResponse = {
  success: boolean;
  metadata?: unknown[];
};

export async function uploadFiles(
  files: File[] | FileList,
  uploadId: string
): Promise<UploadResponse> {
  const fileArray = Array.from(files);
  const formData = new FormData();
  for (const file of fileArray) {
    formData.append("files", file);
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "x-upload-id": uploadId,
      "x-total-files": String(fileArray.length),
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
