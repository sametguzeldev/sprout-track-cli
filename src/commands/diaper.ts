import { Command } from 'commander';
import {
  getDiaperLogs,
  getDiaperLog,
  createDiaperLog,
  updateDiaperLog,
  deleteDiaperLog,
} from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, now } from '../utils/date.js';
import {
  optionalString,
  parseBoolean,
  validateDiaperType,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, DiaperLogCreate } from '../types/index.js';

const diaperColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'time', header: 'Time', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'type', header: 'Type', width: 8 },
  { key: 'color', header: 'Color', width: 12 },
  { key: 'blowout', header: 'Blowout', width: 8, formatter: (v) => v ? 'Yes' : 'No' },
];

const diaperFields = [
  { key: 'id', label: 'ID' },
  { key: 'time', label: 'Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'type', label: 'Type' },
  { key: 'condition', label: 'Condition' },
  { key: 'color', label: 'Color' },
  { key: 'blowout', label: 'Blowout', formatter: (v: unknown) => v ? 'Yes' : 'No' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

function getBabyId(opts: { baby?: string }): string {
  const babyId = opts.baby || getDefaultBabyId();
  if (!babyId) {
    throw new ValidationError('Baby ID is required. Use --baby <id> or run: sprout-track baby select <id>');
  }
  return babyId;
}

export function registerDiaperCommands(program: Command): void {
  const diaper = program
    .command('diaper')
    .description('Log and manage diaper changes');

  diaper
    .command('list')
    .description('List diaper logs')
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
      const spin = spinner('Fetching diaper logs...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const logs = await getDiaperLogs(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(logs, {
          format: format as OutputFormat,
          columns: diaperColumns,
          plainFields: ['id', 'time', 'type', 'color', 'blowout'],
        });
      } catch (err) {
        spin.fail('Failed to fetch diaper logs');
        error(formatError(err));
        process.exit(1);
      }
    });

  diaper
    .command('get <id>')
    .description('Get diaper log details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching diaper log...');

      try {
        const log = await getDiaperLog(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: diaperFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch diaper log');
        error(formatError(err));
        process.exit(1);
      }
    });

  diaper
    .command('create')
    .description('Create a diaper log')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--type <type>', 'Diaper type (WET, DIRTY, BOTH)')
    .option('--time <time>', 'Time (ISO8601, default: now)')
    .option('--condition <condition>', 'Condition description')
    .option('--color <color>', 'Color')
    .option('--blowout', 'Mark as blowout')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      type: string;
      time?: string;
      condition?: string;
      color?: string;
      blowout?: boolean;
      output?: string;
    }) => {
      const spin = spinner('Creating diaper log...');

      try {
        const data: DiaperLogCreate = {
          babyId: opts.baby,
          time: opts.time || now(),
          type: validateDiaperType(opts.type),
        };

        if (opts.condition) data.condition = opts.condition;
        if (opts.color) data.color = opts.color;
        if (opts.blowout) data.blowout = true;

        const log = await createDiaperLog(data);
        spin.succeed('Diaper log created');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: diaperFields,
        });
      } catch (err) {
        spin.fail('Failed to create diaper log');
        error(formatError(err));
        process.exit(1);
      }
    });

  // Quick log commands
  const logCmd = diaper
    .command('log')
    .description('Quick log diaper changes');

  logCmd
    .command('wet')
    .description('Quick log wet diaper')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { baby?: string; output?: string }) => {
      const spin = spinner('Logging wet diaper...');

      try {
        const babyId = getBabyId(opts);
        const data: DiaperLogCreate = {
          babyId,
          time: now(),
          type: 'WET',
        };

        const log = await createDiaperLog(data);
        spin.succeed('Wet diaper logged');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: diaperFields,
        });
      } catch (err) {
        spin.fail('Failed to log wet diaper');
        error(formatError(err));
        process.exit(1);
      }
    });

  logCmd
    .command('dirty')
    .description('Quick log dirty diaper')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('--color <color>', 'Color')
    .option('--condition <condition>', 'Condition description')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      color?: string;
      condition?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging dirty diaper...');

      try {
        const babyId = getBabyId(opts);
        const data: DiaperLogCreate = {
          babyId,
          time: now(),
          type: 'DIRTY',
        };

        if (opts.color) data.color = opts.color;
        if (opts.condition) data.condition = opts.condition;

        const log = await createDiaperLog(data);
        spin.succeed('Dirty diaper logged');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: diaperFields,
        });
      } catch (err) {
        spin.fail('Failed to log dirty diaper');
        error(formatError(err));
        process.exit(1);
      }
    });

  logCmd
    .command('both')
    .description('Quick log wet and dirty diaper')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('--color <color>', 'Color')
    .option('--condition <condition>', 'Condition description')
    .option('--blowout', 'Mark as blowout')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      color?: string;
      condition?: string;
      blowout?: boolean;
      output?: string;
    }) => {
      const spin = spinner('Logging diaper...');

      try {
        const babyId = getBabyId(opts);
        const data: DiaperLogCreate = {
          babyId,
          time: now(),
          type: 'BOTH',
        };

        if (opts.color) data.color = opts.color;
        if (opts.condition) data.condition = opts.condition;
        if (opts.blowout) data.blowout = true;

        const log = await createDiaperLog(data);
        const blowoutText = opts.blowout ? ' (blowout!)' : '';
        spin.succeed(`Wet & dirty diaper logged${blowoutText}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: diaperFields,
        });
      } catch (err) {
        spin.fail('Failed to log diaper');
        error(formatError(err));
        process.exit(1);
      }
    });

  diaper
    .command('update <id>')
    .description('Update a diaper log')
    .option('--time <time>', 'Time (ISO8601)')
    .option('--type <type>', 'Diaper type (WET, DIRTY, BOTH)')
    .option('--condition <condition>', 'Condition description')
    .option('--color <color>', 'Color')
    .option('--blowout <bool>', 'Blowout status')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      time?: string;
      type?: string;
      condition?: string;
      color?: string;
      blowout?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating diaper log...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.time) data.time = opts.time;
        if (opts.type) data.type = validateDiaperType(opts.type);
        if (opts.condition) data.condition = opts.condition;
        if (opts.color) data.color = opts.color;
        if (opts.blowout !== undefined) data.blowout = parseBoolean(opts.blowout);

        const log = await updateDiaperLog(id, data as any);
        spin.succeed('Diaper log updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: diaperFields,
        });
      } catch (err) {
        spin.fail('Failed to update diaper log');
        error(formatError(err));
        process.exit(1);
      }
    });

  diaper
    .command('delete <id>')
    .description('Delete a diaper log')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this diaper log?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting diaper log...');
        await deleteDiaperLog(id);
        spin.succeed('Diaper log deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
