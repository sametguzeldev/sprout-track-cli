import { Command } from 'commander';
import {
  getPumpLogs,
  getPumpLog,
  createPumpLog,
  updatePumpLog,
  deletePumpLog,
} from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, now, formatDuration } from '../utils/date.js';
import {
  optionalNumber,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, PumpLogCreate, PumpLogResponse } from '../types/index.js';

const pumpColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'startTime', header: 'Start', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'endTime', header: 'End', width: 18, formatter: (v) => v ? formatDate(v as string) : 'Ongoing' },
  { key: 'leftAmount', header: 'Left', width: 8 },
  { key: 'rightAmount', header: 'Right', width: 8 },
  { key: 'totalAmount', header: 'Total', width: 8 },
  { key: 'unitAbbr', header: 'Unit', width: 6 },
];

const pumpFields = [
  { key: 'id', label: 'ID' },
  { key: 'startTime', label: 'Start Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'endTime', label: 'End Time', formatter: (v: unknown) => v ? formatDate(v as string) : 'Ongoing' },
  { key: 'duration', label: 'Duration', formatter: (v: unknown) => formatDuration(v as number) },
  { key: 'leftAmount', label: 'Left Amount' },
  { key: 'rightAmount', label: 'Right Amount' },
  { key: 'totalAmount', label: 'Total Amount' },
  { key: 'unitAbbr', label: 'Unit' },
  { key: 'notes', label: 'Notes' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

function getBabyId(opts: { baby?: string }): string {
  const babyId = opts.baby || getDefaultBabyId();
  if (!babyId) {
    throw new ValidationError('Baby ID is required. Use --baby <id> or run: sprout-track baby select <id>');
  }
  return babyId;
}

export function registerPumpCommands(program: Command): void {
  const pump = program
    .command('pump')
    .description('Log and manage pumping sessions');

  pump
    .command('list')
    .description('List pump logs')
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
      const spin = spinner('Fetching pump logs...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const logs = await getPumpLogs(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(logs, {
          format: format as OutputFormat,
          columns: pumpColumns,
          plainFields: ['id', 'startTime', 'endTime', 'leftAmount', 'rightAmount', 'totalAmount'],
        });
      } catch (err) {
        spin.fail('Failed to fetch pump logs');
        error(formatError(err));
        process.exit(1);
      }
    });

  pump
    .command('get <id>')
    .description('Get pump log details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching pump log...');

      try {
        const log = await getPumpLog(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: pumpFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch pump log');
        error(formatError(err));
        process.exit(1);
      }
    });

  pump
    .command('create')
    .description('Create a pump log')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--start <time>', 'Start time (ISO8601)')
    .option('--end <time>', 'End time (ISO8601)')
    .option('--left <amount>', 'Left side amount')
    .option('--right <amount>', 'Right side amount')
    .option('--unit <unit>', 'Unit (OZ, ML, default: OZ)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      start: string;
      end?: string;
      left?: string;
      right?: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating pump log...');

      try {
        const data: PumpLogCreate = {
          babyId: opts.baby,
          startTime: opts.start,
        };

        if (opts.end) data.endTime = opts.end;
        if (opts.left) data.leftAmount = optionalNumber(opts.left);
        if (opts.right) data.rightAmount = optionalNumber(opts.right);
        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.notes) data.notes = opts.notes;

        // Calculate total if both sides provided
        if (data.leftAmount !== undefined && data.rightAmount !== undefined) {
          data.totalAmount = data.leftAmount + data.rightAmount;
        }

        const log = await createPumpLog(data);
        spin.succeed('Pump log created');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: pumpFields,
        });
      } catch (err) {
        spin.fail('Failed to create pump log');
        error(formatError(err));
        process.exit(1);
      }
    });

  pump
    .command('start')
    .description('Start a pumping session')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Starting pump session...');

      try {
        const babyId = getBabyId(opts);

        // Check for ongoing pump session
        const existingLogs = await getPumpLogs({ babyId });
        const ongoingPump = existingLogs.find((log: PumpLogResponse) => !log.endTime);
        if (ongoingPump) {
          spin.fail('There is already an ongoing pump session');
          error(`End the existing session first (ID: ${ongoingPump.id})`);
          process.exit(1);
        }

        const data: PumpLogCreate = {
          babyId,
          startTime: now(),
        };

        if (opts.notes) data.notes = opts.notes;

        const log = await createPumpLog(data);
        spin.succeed('Pump session started');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: pumpFields,
        });
      } catch (err) {
        spin.fail('Failed to start pump session');
        error(formatError(err));
        process.exit(1);
      }
    });

  pump
    .command('end')
    .description('End an ongoing pump session')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--left <amount>', 'Left side amount')
    .requiredOption('--right <amount>', 'Right side amount')
    .option('--unit <unit>', 'Unit (OZ, ML, default: OZ)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      left: string;
      right: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Ending pump session...');

      try {
        const babyId = getBabyId(opts);

        // Find ongoing pump session
        const existingLogs = await getPumpLogs({ babyId });
        const ongoingPump = existingLogs.find((log: PumpLogResponse) => !log.endTime);

        if (!ongoingPump) {
          spin.fail('No ongoing pump session found');
          process.exit(1);
        }

        const leftAmount = optionalNumber(opts.left) || 0;
        const rightAmount = optionalNumber(opts.right) || 0;

        const data: Record<string, unknown> = {
          endTime: now(),
          leftAmount,
          rightAmount,
          totalAmount: leftAmount + rightAmount,
        };

        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.notes) data.notes = opts.notes;

        const log = await updatePumpLog(ongoingPump.id, data as any);

        const total = leftAmount + rightAmount;
        spin.succeed(`Pump session ended (${total} ${opts.unit || 'OZ'} total)`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: pumpFields,
        });
      } catch (err) {
        spin.fail('Failed to end pump session');
        error(formatError(err));
        process.exit(1);
      }
    });

  pump
    .command('log')
    .description('Quick log a completed pump session')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--left <amount>', 'Left side amount')
    .requiredOption('--right <amount>', 'Right side amount')
    .option('--unit <unit>', 'Unit (OZ, ML, default: OZ)')
    .option('--duration <minutes>', 'Duration in minutes')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      left: string;
      right: string;
      unit?: string;
      duration?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging pump session...');

      try {
        const babyId = getBabyId(opts);
        const leftAmount = optionalNumber(opts.left) || 0;
        const rightAmount = optionalNumber(opts.right) || 0;
        const durationMinutes = optionalNumber(opts.duration) || 15;

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - durationMinutes * 60000);

        const data: PumpLogCreate = {
          babyId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          leftAmount,
          rightAmount,
          totalAmount: leftAmount + rightAmount,
          unitAbbr: opts.unit || 'OZ',
        };

        if (opts.notes) data.notes = opts.notes;

        const log = await createPumpLog(data);
        const total = leftAmount + rightAmount;
        spin.succeed(`Pump logged (${total} ${data.unitAbbr} total)`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: pumpFields,
        });
      } catch (err) {
        spin.fail('Failed to log pump session');
        error(formatError(err));
        process.exit(1);
      }
    });

  pump
    .command('update <id>')
    .description('Update a pump log')
    .option('--start <time>', 'Start time (ISO8601)')
    .option('--end <time>', 'End time (ISO8601)')
    .option('--left <amount>', 'Left side amount')
    .option('--right <amount>', 'Right side amount')
    .option('--unit <unit>', 'Unit')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      start?: string;
      end?: string;
      left?: string;
      right?: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating pump log...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.start) data.startTime = opts.start;
        if (opts.end) data.endTime = opts.end;
        if (opts.left) data.leftAmount = optionalNumber(opts.left);
        if (opts.right) data.rightAmount = optionalNumber(opts.right);
        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.notes) data.notes = opts.notes;

        // Recalculate total if amounts changed
        if (data.leftAmount !== undefined || data.rightAmount !== undefined) {
          const left = (data.leftAmount as number) ?? 0;
          const right = (data.rightAmount as number) ?? 0;
          data.totalAmount = left + right;
        }

        const log = await updatePumpLog(id, data as any);
        spin.succeed('Pump log updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: pumpFields,
        });
      } catch (err) {
        spin.fail('Failed to update pump log');
        error(formatError(err));
        process.exit(1);
      }
    });

  pump
    .command('delete <id>')
    .description('Delete a pump log')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this pump log?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting pump log...');
        await deletePumpLog(id);
        spin.succeed('Pump log deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
