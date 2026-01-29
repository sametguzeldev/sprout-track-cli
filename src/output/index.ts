import chalk from 'chalk';
import ora from 'ora';
import type { OutputFormat } from '../types/index.js';
import { formatJson } from './json.js';
import { formatTable, formatKeyValue, type TableColumn } from './table.js';
import { formatPlain, formatPlainSingle } from './plain.js';
import { getOutputFormat } from '../config/store.js';

export { formatJson } from './json.js';
export { formatTable, formatKeyValue, truncate, type TableColumn } from './table.js';
export { formatPlain, formatPlainSingle } from './plain.js';

/**
 * Print success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓') + ' ' + message);
}

/**
 * Print error message
 */
export function error(message: string): void {
  console.error(chalk.red('✗') + ' ' + message);
}

/**
 * Print warning message
 */
export function warning(message: string): void {
  console.log(chalk.yellow('⚠') + ' ' + message);
}

/**
 * Print info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ') + ' ' + message);
}

/**
 * Create a spinner for long-running operations
 */
export function spinner(text: string) {
  return ora({ text, color: 'cyan' }).start();
}

/**
 * Print data in the configured format
 */
export function output<T extends Record<string, unknown>>(
  data: T | T[],
  options: {
    format?: OutputFormat;
    columns?: TableColumn[];
    fields?: Array<{ key: string; label: string; formatter?: (value: unknown) => string }>;
    plainFields?: string[];
  }
): void {
  const format = options.format || getOutputFormat();

  if (format === 'json') {
    console.log(formatJson(data));
    return;
  }

  const isArray = Array.isArray(data);

  if (format === 'table') {
    if (isArray) {
      if (options.columns) {
        console.log(formatTable(data, options.columns));
      } else {
        console.log(formatJson(data));
      }
    } else {
      if (options.fields) {
        console.log(formatKeyValue(data, options.fields));
      } else {
        console.log(formatJson(data));
      }
    }
    return;
  }

  // Plain format
  if (isArray) {
    if (options.plainFields) {
      console.log(formatPlain(data, options.plainFields));
    } else if (options.columns) {
      console.log(formatPlain(data, options.columns.map(c => c.key)));
    } else {
      console.log(formatJson(data));
    }
  } else {
    if (options.fields) {
      console.log(formatPlainSingle(data, options.fields.map(f => ({ key: f.key, label: f.label }))));
    } else {
      console.log(formatJson(data));
    }
  }
}

/**
 * Print a horizontal rule
 */
export function hr(char: string = '-', length: number = 40): void {
  console.log(chalk.gray(char.repeat(length)));
}

/**
 * Print a heading
 */
export function heading(text: string): void {
  console.log();
  console.log(chalk.bold(text));
  hr();
}

/**
 * Colorize value based on type
 */
export function colorize(value: unknown): string {
  if (value === null || value === undefined) {
    return chalk.gray('-');
  }
  if (typeof value === 'boolean') {
    return value ? chalk.green('Yes') : chalk.red('No');
  }
  if (typeof value === 'number') {
    return chalk.yellow(String(value));
  }
  return String(value);
}
