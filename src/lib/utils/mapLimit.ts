/**
 * 배열 항목을 동시 실행 수(limit)로 제한하여 비동기 처리합니다.
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      while (true) {
        const current = nextIndex++;
        if (current >= items.length) break;
        results[current] = await fn(items[current], current);
      }
    }
  );

  await Promise.all(workers);
  return results;
}
