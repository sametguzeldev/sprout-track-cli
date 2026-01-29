import { Command } from 'commander';
import {
  getSleepLogs,
  getSleepLog,
  createSleepLog,
  updateSleepLog,
  deleteSleepLog,
} from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, now, formatDuration } from '../utils/date.js';
import {
  optionalString,
  validateSleepType,
  validateSleepQuality,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, SleepLogCreate, SleepLogResponse } from '../types/index.js';

const sleepColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'startTime', header: 'Start', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'endTime', header: 'End', width: 18, formatter: (v) => v ? formatDate(v as string) : 'Ongoing' },
  { key: 'type', header: 'Type', width: 12 },
  { key: 'duration', header: 'Duration', width: 10, formatter: (v) => formatDuration(v as number) },
  { key: 'quality', header: 'Quality', width: 10 },
];

const sleepFields = [
  { key: 'id', label: 'ID' },
  { key: 'startTime', label: 'Start Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'endTime', label: 'End Time', formatter: (v: unknown) => v ? formatDate(v as string) : 'Ongoing' },
  { key: 'type', label: 'Type' },
  { key: 'duration', label: 'Duration', formatter: (v: unknown) => formatDuration(v as number) },
  { key: 'location', label: 'Location' },
  { key: 'quality', label: 'Quality' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

function getBabyId(opts: { baby?: string }): string {
  const babyId = opts.baby || getDefaultBabyId();
  if (!babyId) {
    throw new ValidationError('Baby ID is required. Use --baby <id> or run: sprout-track baby select <id>');
  }
  return babyId;
}

export function registerSleepCommands(program: Command): void {
  const sleep = program
    .command('sleep')
    .description('Log and manage sleep activities');

  sleep
    .command('list')
    .description('List sleep logs')
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
      const spin = spinner('Fetching sleep logs...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const logs = await getSleepLogs(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(logs, {
          format: format as OutputFormat,
          columns: sleepColumns,
          plainFields: ['id', 'startTime', 'endTime', 'type', 'duration'],
        });
      } catch (err) {
        spin.fail('Failed to fetch sleep logs');
        error(formatError(err));
        process.exit(1);
      }
    });

  sleep
    .command('get <id>')
    .description('Get sleep log details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching sleep log...');

      try {
        const log = await getSleepLog(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: sleepFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch sleep log');
        error(formatError(err));
        process.exit(1);
      }
    });

  sleep
    .command('create')
    .description('Create a sleep log')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--type <type>', 'Sleep type (NAP, NIGHT_SLEEP)')
    .requiredOption('--start <time>', 'Start time (ISO8601)')
    .option('--end <time>', 'End time (ISO8601)')
    .option('--location <location>', 'Sleep location')
    .option('--quality <quality>', 'Sleep quality (POOR, FAIR, GOOD, EXCELLENT)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      type: string;
      start: string;
      end?: string;
      location?: string;
      quality?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating sleep log...');

      try {
        const data: SleepLogCreate = {
          babyId: opts.baby,
          startTime: opts.start,
          type: validateSleepType(opts.type),
        };

        if (opts.end) data.endTime = opts.end;
        if (opts.location) data.location = opts.location;
        if (opts.quality) data.quality = validateSleepQuality(opts.quality);

        const log = await createSleepLog(data);
        spin.succeed('Sleep log created');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: sleepFields,
        });
      } catch (err) {
        spin.fail('Failed to create sleep log');
        error(formatError(err));
        process.exit(1);
      }
    });

  sleep
    .command('start')
    .description('Start a sleep session')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--type <type>', 'Sleep type (NAP, NIGHT_SLEEP)')
    .option('--location <location>', 'Sleep location')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      type: string;
      location?: string;
      output?: string;
    }) => {
      const spin = spinner('Starting sleep session...');

      try {
        const babyId = getBabyId(opts);

        // Check for ongoing sleep
        const existingLogs = await getSleepLogs({ babyId });
        const ongoingSleep = existingLogs.find((log: SleepLogResponse) => !log.endTime);
        if (ongoingSleep) {
          spin.fail('There is already an ongoing sleep session');
          error(`End the existing session first (ID: ${ongoingSleep.id})`);
          process.exit(1);
        }

        const data: SleepLogCreate = {
          babyId,
          startTime: now(),
          type: validateSleepType(opts.type),
        };

        if (opts.location) data.location = opts.location;

        const log = await createSleepLog(data);
        spin.succeed(`Sleep started (${opts.type})`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: sleepFields,
        });
      } catch (err) {
        spin.fail('Failed to start sleep session');
        error(formatError(err));
        process.exit(1);
      }
    });

  sleep
    .command('end')
    .description('End an ongoing sleep session')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('--quality <quality>', 'Sleep quality (POOR, FAIR, GOOD, EXCELLENT)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      quality?: string;
      output?: string;
    }) => {
      const spin = spinner('Ending sleep session...');

      try {
        const babyId = getBabyId(opts);

        // Find ongoing sleep
        const existingLogs = await getSleepLogs({ babyId });
        const ongoingSleep = existingLogs.find((log: SleepLogResponse) => !log.endTime);

        if (!ongoingSleep) {
          spin.fail('No ongoing sleep session found');
          process.exit(1);
        }

        const data: Record<string, unknown> = {
          endTime: now(),
        };

        if (opts.quality) data.quality = validateSleepQuality(opts.quality);

        const log = await updateSleepLog(ongoingSleep.id, data as any);

        // Calculate duration for display
        const startTime = new Date(ongoingSleep.startTime);
        const endTime = new Date();
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        spin.succeed(`Sleep ended (${formatDuration(durationMinutes)})`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: sleepFields,
        });
      } catch (err) {
        spin.fail('Failed to end sleep session');
        error(formatError(err));
        process.exit(1);
      }
    });

  sleep
    .command('update <id>')
    .description('Update a sleep log')
    .option('--start <time>', 'Start time (ISO8601)')
    .option('--end <time>', 'End time (ISO8601)')
    .option('--type <type>', 'Sleep type (NAP, NIGHT_SLEEP)')
    .option('--location <location>', 'Sleep location')
    .option('--quality <quality>', 'Sleep quality (POOR, FAIR, GOOD, EXCELLENT)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      start?: string;
      end?: string;
      type?: string;
      location?: string;
      quality?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating sleep log...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.start) data.startTime = opts.start;
        if (opts.end) data.endTime = opts.end;
        if (opts.type) data.type = validateSleepType(opts.type);
        if (opts.location) data.location = opts.location;
        if (opts.quality) data.quality = validateSleepQuality(opts.quality);

        const log = await updateSleepLog(id, data as any);
        spin.succeed('Sleep log updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: sleepFields,
        });
      } catch (err) {
        spin.fail('Failed to update sleep log');
        error(formatError(err));
        process.exit(1);
      }
    });

  sleep
    .command('delete <id>')
    .description('Delete a sleep log')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this sleep log?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting sleep log...');
        await deleteSleepLog(id);
        spin.succeed('Sleep log deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
