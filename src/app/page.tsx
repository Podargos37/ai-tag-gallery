import GalleryClient from "@/components/GalleryClient";
import { getImageMetadataList } from "@/lib/images";

export default async function Home() {
  const initialImages = await getImageMetadataList();

  return (
    <div className="space-y-8">
      {/* 클라이언트 컴포넌트인 GalleryClient에 초기 데이터 전달 */}
      <GalleryClient initialImages={initialImages} />
    </div>
  );
}