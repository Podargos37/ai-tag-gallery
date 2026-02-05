export interface Folder {
  id: string;
  name: string;
  imageIds: string[];
}

export interface FoldersData {
  folders: Folder[];
}
