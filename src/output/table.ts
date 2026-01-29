import Table from 'cli-table3';

export interface TableColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: unknown) => string;
}

/**
 * Create a formatted table from array of objects
 */
export function formatTable<T extends Record<string, unknown>>(
  data: T[],
  columns: TableColumn[]
): string {
  if (data.length === 0) {
    return 'No data found.';
  }

  const table = new Table({
    head: columns.map(col => col.header),
    colWidths: columns.map(col => col.width ?? null),
    colAligns: columns.map(col => col.align || 'left'),
    style: {
      head: ['cyan'],
      border: ['gray'],
    },
    wordWrap: true,
  });

  for (const item of data) {
    const row = columns.map(col => {
      const value = getNestedValue(item, col.key);
      if (col.formatter) {
        return col.formatter(value);
      }
      return formatValue(value);
    });
    table.push(row);
  }

  return table.toString();
}

/**
 * Create a key-value display for a single object
 */
export function formatKeyValue<T extends Record<string, unknown>>(
  data: T,
  fields: Array<{ key: string; label: string; formatter?: (value: unknown) => string }>
): string {
  const maxLabelLength = Math.max(...fields.map(f => f.label.length));

  const lines = fields.map(field => {
    const value = getNestedValue(data, field.key);
    const formattedValue = field.formatter ? field.formatter(value) : formatValue(value);
    return `${field.label.padEnd(maxLabelLength + 2)}: ${formattedValue}`;
  });

  return lines.join('\n');
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj as unknown);
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
