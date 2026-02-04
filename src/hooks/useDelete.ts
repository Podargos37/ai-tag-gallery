import { deleteImage as deleteImageApi } from "@/lib/api/delete";

export function useDelete(setFilteredImages: React.Dispatch<React.SetStateAction<any[]>>) {
  const deleteImage = async (id: string, filename: string) => {
    try {
      const ok = await deleteImageApi(id, filename);
      if (ok) {
        setFilteredImages((prev) => prev.filter((img) => img.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error("삭제 중 에러 발생:", error);
      return false;
    }
  };

  return { deleteImage };
}