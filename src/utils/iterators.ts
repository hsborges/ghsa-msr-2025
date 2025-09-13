/**
 * Collects results from an async iterator into an array.
 *
 * @param iterator The async iterator to collect from.
 * @param limit Maximum number of items to collect.
 * @returns A promise that resolves to an array of collected results.
 */
export async function collectAsyncIterator<T>(
  iterator: AsyncIterable<T> | AsyncIterator<T>,
  limit?: number,
): Promise<T[]> {
  const results: T[] = [];
  let count = 0;
  for await (const item of iterator as AsyncIterable<T>) {
    results.push(item);
    count++;
    if (limit !== undefined && count >= limit) break;
  }
  return results;
}
