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
