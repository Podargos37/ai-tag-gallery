/**
 * 기존 메타데이터(JSON)에 width/height가 없는 이미지에 대해
 * 원본 또는 썸네일 파일에서 크기를 읽어 메타데이터를 보정합니다.
 *
 * 사용법: 프로젝트 루트에서
 *   node scripts/backfill-image-dimensions.js
 * 또는
 *   npm run backfill-dimensions
 *
 * public/metadata/*.json 을 수정하므로, 필요 시 백업 후 실행하세요.
 */

const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

const METADATA_DIR = path.join(process.cwd(), "public", "metadata");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMB_DIR = path.join(process.cwd(), "public", "thumbnails");

async function getImageDimensions(filePath) {
  const meta = await sharp(filePath).rotate().metadata();
  const w = meta.width;
  const h = meta.height;
  if (typeof w === "number" && typeof h === "number" && h > 0) {
    return { width: w, height: h };
  }
  return null;
}

async function backfillDimensions() {
  console.log("Backfill: 이미지 메타데이터에 width/height 채우기\n");

  let dir;
  try {
    dir = await fs.readdir(METADATA_DIR);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log("public/metadata 폴더가 없습니다. 종료합니다.");
      return;
    }
    throw e;
  }

  const jsonFiles = dir.filter((f) => f.endsWith(".json"));
  if (jsonFiles.length === 0) {
    console.log("처리할 메타데이터 파일이 없습니다.");
    return;
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(METADATA_DIR, file);
    let data;
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      data = JSON.parse(raw);
    } catch (e) {
      console.warn(`  [skip] ${file}: JSON 읽기 실패`, e.message);
      failed += 1;
      continue;
    }

    if (data.width != null && data.height != null && data.height > 0) {
      skipped += 1;
      continue;
    }

    let dimensions = null;
    const uploadPath = data.filename && path.join(UPLOAD_DIR, data.filename);
    const thumbPath = data.thumbnail && path.join(THUMB_DIR, data.thumbnail);

    if (uploadPath) {
      try {
        await fs.access(uploadPath);
        dimensions = await getImageDimensions(uploadPath);
      } catch {
        // 원본 없음, 썸네일로 시도
      }
    }
    if (!dimensions && thumbPath) {
      try {
        await fs.access(thumbPath);
        dimensions = await getImageDimensions(thumbPath);
      } catch (e) {
        // 썸네일도 없음
      }
    }

    if (!dimensions) {
      console.warn(`  [skip] ${file} (id: ${data.id}): 이미지 파일을 찾을 수 없거나 읽기 실패`);
      failed += 1;
      continue;
    }

    data.width = dimensions.width;
    data.height = dimensions.height;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    updated += 1;
    console.log(`  [ok] ${file} → ${dimensions.width}x${dimensions.height}`);
  }

  console.log("\n완료:");
  console.log(`  업데이트: ${updated}, 이미 있음(스킵): ${skipped}, 실패: ${failed}`);
}

backfillDimensions().catch((e) => {
  console.error(e);
  process.exit(1);
});
