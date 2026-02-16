/** UI 전용: "미분류만 보기" 선택 시 사용하는 sentinel (저장/API에는 사용 안 함) */
export const UNFOLDERED_ID = "__unfoldered__" as const;

export interface Folder {
  id: string;
  name: string;
  imageIds: string[];
}

export interface FoldersData {
  folders: Folder[];
}
