/**
 * Format data as JSON string
 */
export function formatJson<T>(data: T): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format data as compact JSON (single line)
 */
export function formatJsonCompact<T>(data: T): string {
  return JSON.stringify(data);
}
