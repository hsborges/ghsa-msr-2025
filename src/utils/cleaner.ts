export function clearObject<T>(obj: T): T {
  if (!obj) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => clearObject(item)) as unknown as T;
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && key.endsWith('url') && obj[key].startsWith('https://api.github.com')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        clearObject(obj[key]);
      }
    }
  }
  return obj;
}
