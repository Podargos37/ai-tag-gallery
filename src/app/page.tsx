import fs from "fs/promises";
import path from "path";
import GalleryClient from "@/components/GalleryClient";

// [1] 서버에서 저장된 이미지 메타데이터(JSON)를 읽어오는 비동기 함수
async function getStoredImages() {
  // 메타데이터가 저장된 실제 경로 설정 (public/metadata)
  const metadataDir = path.join(process.cwd(), "public", "metadata");
  
  try {
    // 해당 디렉토리가 없으면 생성 (recursive: true로 상위 폴더까지 확인)
    await fs.mkdir(metadataDir, { recursive: true });
    
    // 디렉토리 내의 모든 파일 목록을 읽음
    const files = await fs.readdir(metadataDir);
    
    // 파일 목록을 순회하며 실제 데이터를 객체로 변환
    const images = await Promise.all(
      files
        .filter((file) => file.endsWith(".json")) // JSON 파일만 필터링
        .map(async (file) => {
          // 파일 내용 읽기
          const content = await fs.readFile(path.join(metadataDir, file), "utf-8");
          const data = JSON.parse(content); 

          // 데이터 가공: 기본 데이터에 notes가 없을 경우 빈 문자열 추가
          return {
            ...data,
            notes: data.notes || ""
          };
        })
    );
    
    // ID를 기준으로 내림차순 정렬 (최신순)
    return images.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (e) {
    console.error("데이터 로드 실패:", e);
    return []; // 에러 발생 시 빈 배열 반환하여 크래시 방지
  }
}

// [2] 메인 페이지 컴포넌트 (서버 컴포넌트)
export default async function Home() {
  // 서버 사이드에서 데이터를 먼저 가져옴
  const initialImages = await getStoredImages();

  return (
    <div className="space-y-8">
      {/* 클라이언트 컴포넌트인 GalleryClient에 초기 데이터 전달 */}
      <GalleryClient initialImages={initialImages} />
    </div>
  );
}