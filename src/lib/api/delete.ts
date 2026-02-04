export async function deleteImage(id: string, filename: string): Promise<boolean> {
  const res = await fetch(`/api/delete?id=${id}&filename=${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });
  return res.ok;
}
