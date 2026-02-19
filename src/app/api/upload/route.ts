import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { readExcludeTagsFromFile } from "@/lib/server/exclude-tags";
import { mapLimit } from "@/lib/utils/mapLimit";
import { UPLOAD_DIR, THUMB_DIR } from "@/lib/upload/constants";
import { processOneImage } from "@/lib/upload/processImage";
import { deleteProgress, setProgress } from "./progressStore";

export async function POST(req: NextRequest) {
  try {
    const uploadId = req.headers.get("x-upload-id") ?? "";
    const hintedTotal = Number(req.headers.get("x-total-files") || "0") || 0;
    if (uploadId) {
      setProgress(uploadId, {
        status: "uploading",
        total: hintedTotal,
        processed: 0,
        updatedAt: Date.now(),
      });
    }

    const formData = await req.formData();
    const files = (formData.getAll("files") as File[]).filter(Boolean);
    const legacySingle = formData.get("file") as File | null;
    const allFiles = files.length > 0 ? files : legacySingle ? [legacySingle] : [];
    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const excludeList = await readExcludeTagsFromFile();
    const excludeTagSet = new Set(
      excludeList.map((t) => String(t).toLowerCase().trim()).filter(Boolean)
    );

    const imageFiles = allFiles.filter((f) =>
      (f?.type ?? "").startsWith("image/")
    );
    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "No image files" }, { status: 400 });
    }

    await Promise.all([
      fs.mkdir(UPLOAD_DIR, { recursive: true }),
      fs.mkdir(THUMB_DIR, { recursive: true }),
    ]);

    const baseId = Date.now();
    if (uploadId) {
      setProgress(uploadId, {
        status: "processing",
        total: imageFiles.length,
        processed: 0,
        updatedAt: Date.now(),
      });
    }

    let completed = 0;
    const total = imageFiles.length;
    const metadataList = await mapLimit(imageFiles, 3, (file, index) =>
      processOneImage(file, index, {
        baseId,
        excludeTagSet,
        onComplete: uploadId
          ? () => {
              completed += 1;
              setProgress(uploadId, {
                status: "processing",
                total,
                processed: completed,
                updatedAt: Date.now(),
              });
            }
          : undefined,
      })
    );

    if (uploadId) {
      setProgress(uploadId, {
        status: "done",
        total: imageFiles.length,
        processed: imageFiles.length,
        updatedAt: Date.now(),
      });
      setTimeout(() => deleteProgress(uploadId), 30_000);
    }

    return NextResponse.json({ success: true, metadata: metadataList });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
