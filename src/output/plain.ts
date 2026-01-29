/**
 * Format data as plain text
 */
export function formatPlain<T extends Record<string, unknown>>(
  data: T[],
  fields: string[],
  separator: string = '\t'
): string {
  if (data.length === 0) {
    return 'No data found.';
  }

  const lines = data.map(item => {
    return fields.map(field => {
      const value = getNestedValue(item, field);
      return formatValue(value);
    }).join(separator);
  });

  return lines.join('\n');
}

/**
 * Format single item as plain text
 */
export function formatPlainSingle<T extends Record<string, unknown>>(
  data: T,
  fields: Array<{ key: string; label: string }>
): string {
  return fields.map(field => {
    const value = getNestedValue(data, field.key);
    return `${field.label}: ${formatValue(value)}`;
  }).join('\n');
}

/**
 * Get nested value from object
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj as unknown);
}

/**
 * Format value for plain text output
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  if (Array.isArray(value)) {
    return value.join(',');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
