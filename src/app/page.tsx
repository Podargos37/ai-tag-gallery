import fs from "fs/promises";
import path from "path";
import GalleryClient from "@/components/GalleryClient";

async function getStoredImages() {
  const metadataDir = path.join(process.cwd(), "public", "metadata");
  try {
    await fs.mkdir(metadataDir, { recursive: true });
    const files = await fs.readdir(metadataDir);
    const images = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const content = await fs.readFile(path.join(metadataDir, file), "utf-8");
          return JSON.parse(content);
        })
    );
    return images.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const initialImages = await getStoredImages();

  return (
    <div className="space-y-8">
      <GalleryClient initialImages={initialImages} />
    </div>
  );
}