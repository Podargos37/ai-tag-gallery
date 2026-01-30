// src/hooks/useDelete.ts
export function useDelete(setFilteredImages: React.Dispatch<React.SetStateAction<any[]>>) {
  const deleteImage = async (id: string, filename: string) => {
    try {
      const res = await fetch(`/api/delete?id=${id}&filename=${filename}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 비서가 주방 보고를 받고 접시(상태)를 치웁니다.
        setFilteredImages((prev) => prev.filter((img) => img.id !== id));
        return true;
      }
      throw new Error("Delete failed");
    } catch (error) {
      console.error("삭제 중 에러 발생:", error);
      return false;
    }
  };

  return { deleteImage };
}