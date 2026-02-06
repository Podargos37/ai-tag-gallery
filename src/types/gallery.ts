/**
 * 갤러리 이미지 메타데이터 (public/metadata/*.json 및 API 응답과 동일한 구조)
 */
export interface ImageItem {
  id: string;
  filename: string;
  thumbnail: string;
  originalName: string;
  tags?: string[];
  width?: number;
  height?: number;
  notes?: string;
  createdAt?: string;
}
