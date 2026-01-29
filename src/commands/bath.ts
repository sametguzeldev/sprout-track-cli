import { Command } from 'commander';
import {
  getBathLogs,
  getBathLog,
  createBathLog,
  updateBathLog,
  deleteBathLog,
} from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, now } from '../utils/date.js';
import {
  parseBoolean,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, BathLogCreate } from '../types/index.js';

const bathColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'time', header: 'Time', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'soapUsed', header: 'Soap', width: 6, formatter: (v) => v ? 'Yes' : 'No' },
  { key: 'shampooUsed', header: 'Shampoo', width: 8, formatter: (v) => v ? 'Yes' : 'No' },
  { key: 'notes', header: 'Notes', width: 30 },
];

const bathFields = [
  { key: 'id', label: 'ID' },
  { key: 'time', label: 'Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'soapUsed', label: 'Soap Used', formatter: (v: unknown) => v ? 'Yes' : 'No' },
  { key: 'shampooUsed', label: 'Shampoo Used', formatter: (v: unknown) => v ? 'Yes' : 'No' },
  { key: 'notes', label: 'Notes' },
  { key: 'babyId', label: 'Baby ID' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

function getBabyId(opts: { baby?: string }): string {
  const babyId = opts.baby || getDefaultBabyId();
  if (!babyId) {
    throw new ValidationError('Baby ID is required. Use --baby <id> or run: sprout-track baby select <id>');
  }
  return babyId;
}

export function registerBathCommands(program: Command): void {
  const bath = program
    .command('bath')
    .description('Log and manage bath activities');

  bath
    .command('list')
    .description('List bath logs')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .option('--start <date>', 'Start date (ISO8601 or YYYY-MM-DD)')
    .option('--end <date>', 'End date (ISO8601 or YYYY-MM-DD)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      start?: string;
      end?: string;
      output?: string;
    }) => {
      const spin = spinner('Fetching bath logs...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const logs = await getBathLogs(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(logs, {
          format: format as OutputFormat,
          columns: bathColumns,
          plainFields: ['id', 'time', 'soapUsed', 'shampooUsed'],
        });
      } catch (err) {
        spin.fail('Failed to fetch bath logs');
        error(formatError(err));
        process.exit(1);
      }
    });

  bath
    .command('get <id>')
    .description('Get bath log details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching bath log...');

      try {
        const log = await getBathLog(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: bathFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch bath log');
        error(formatError(err));
        process.exit(1);
      }
    });

  bath
    .command('create')
    .description('Create a bath log')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .option('--time <time>', 'Time (ISO8601, default: now)')
    .option('--soap', 'Soap was used')
    .option('--no-soap', 'Soap was not used')
    .option('--shampoo', 'Shampoo was used')
    .option('--no-shampoo', 'Shampoo was not used')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      time?: string;
      soap?: boolean;
      shampoo?: boolean;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating bath log...');

      try {
        const data: BathLogCreate = {
          babyId: opts.baby,
          time: opts.time || now(),
          soapUsed: opts.soap !== false,
          shampooUsed: opts.shampoo !== false,
        };

        if (opts.notes) data.notes = opts.notes;

        const log = await createBathLog(data);
        spin.succeed('Bath log created');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: bathFields,
        });
      } catch (err) {
        spin.fail('Failed to create bath log');
        error(formatError(err));
        process.exit(1);
      }
    });

  bath
    .command('log')
    .description('Quick log a bath')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('--soap', 'Soap was used')
    .option('--no-soap', 'Soap was not used')
    .option('--shampoo', 'Shampoo was used')
    .option('--no-shampoo', 'Shampoo was not used')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      soap?: boolean;
      shampoo?: boolean;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging bath...');

      try {
        const babyId = getBabyId(opts);
        const data: BathLogCreate = {
          babyId,
          time: now(),
          soapUsed: opts.soap !== false,
          shampooUsed: opts.shampoo !== false,
        };

        if (opts.notes) data.notes = opts.notes;

        const log = await createBathLog(data);

        const details: string[] = [];
        if (data.soapUsed) details.push('soap');
        if (data.shampooUsed) details.push('shampoo');
        const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';

        spin.succeed(`Bath logged${detailStr}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: bathFields,
        });
      } catch (err) {
        spin.fail('Failed to log bath');
        error(formatError(err));
        process.exit(1);
      }
    });

  bath
    .command('update <id>')
    .description('Update a bath log')
    .option('--time <time>', 'Time (ISO8601)')
    .option('--soap <bool>', 'Soap used')
    .option('--shampoo <bool>', 'Shampoo used')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      time?: string;
      soap?: string;
      shampoo?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating bath log...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.time) data.time = opts.time;
        if (opts.soap !== undefined) data.soapUsed = parseBoolean(opts.soap);
        if (opts.shampoo !== undefined) data.shampooUsed = parseBoolean(opts.shampoo);
        if (opts.notes) data.notes = opts.notes;

        const log = await updateBathLog(id, data as any);
        spin.succeed('Bath log updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: bathFields,
        });
      } catch (err) {
        spin.fail('Failed to update bath log');
        error(formatError(err));
        process.exit(1);
      }
    });

  bath
    .command('delete <id>')
    .description('Delete a bath log')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this bath log?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting bath log...');
        await deleteBathLog(id);
        spin.succeed('Bath log deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
