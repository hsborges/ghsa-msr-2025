import { promises as fs } from 'fs';

/**
 * Writes any JavaScript object to a file as pretty-printed JSON.
 *
 * @param filePath The path to the file where the object should be written.
 * @param obj The object to write.
 */
export async function writeToFile(filePath: string, obj: unknown): Promise<void> {
  return fs.writeFile(filePath, JSON.stringify(obj), 'utf-8');
}

/**
 * Writes a JavaScript object to a file as a newline-delimited JSON (NDJSON) entry.
 *
 * @param filePath The path to the NDJSON file where the object should be written.
 * @param obj The object to write.
 */
export async function writeToNdjsonFile(filePath: string, obj: Array<unknown>): Promise<void> {
  for (const [index, entry] of obj.entries()) {
    if (index === 0) {
      await fs.writeFile(filePath, JSON.stringify(entry) + '\n', 'utf-8');
    } else {
      await fs.appendFile(filePath, JSON.stringify(entry) + '\n', 'utf-8');
    }
  }
}
