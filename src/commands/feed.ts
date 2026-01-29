import { Command } from 'commander';
import {
  getFeedLogs,
  getFeedLog,
  createFeedLog,
  updateFeedLog,
  deleteFeedLog,
} from '../api/endpoints.js';
import { getDefaultBabyId, getDefaultBottleUnit, getDefaultSolidsUnit } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, now, formatDurationSeconds } from '../utils/date.js';
import {
  requireString,
  optionalString,
  optionalNumber,
  validateFeedType,
  validateBreastSide,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, FeedLogCreate } from '../types/index.js';

const feedColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'time', header: 'Time', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'type', header: 'Type', width: 8 },
  { key: 'amount', header: 'Amount', width: 8 },
  { key: 'unitAbbr', header: 'Unit', width: 6 },
  { key: 'side', header: 'Side', width: 6 },
  { key: 'feedDuration', header: 'Duration', width: 10, formatter: (v) => formatDurationSeconds(v as number) },
];

const feedFields = [
  { key: 'id', label: 'ID' },
  { key: 'time', label: 'Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'unitAbbr', label: 'Unit' },
  { key: 'side', label: 'Side' },
  { key: 'food', label: 'Food' },
  { key: 'feedDuration', label: 'Duration', formatter: (v: unknown) => formatDurationSeconds(v as number) },
  { key: 'bottleType', label: 'Bottle Type' },
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

export function registerFeedCommands(program: Command): void {
  const feed = program
    .command('feed')
    .description('Log and manage feeding activities');

  feed
    .command('list')
    .description('List feed logs')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .option('--start <date>', 'Start date (ISO8601 or YYYY-MM-DD)')
    .option('--end <date>', 'End date (ISO8601 or YYYY-MM-DD)')
    .option('--type <type>', 'Filter by type (BREAST, BOTTLE, SOLIDS)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      start?: string;
      end?: string;
      type?: string;
      output?: string;
    }) => {
      const spin = spinner('Fetching feed logs...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;
        if (opts.type) params.type = validateFeedType(opts.type);

        const logs = await getFeedLogs(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(logs, {
          format: format as OutputFormat,
          columns: feedColumns,
          plainFields: ['id', 'time', 'type', 'amount', 'unitAbbr'],
        });
      } catch (err) {
        spin.fail('Failed to fetch feed logs');
        error(formatError(err));
        process.exit(1);
      }
    });

  feed
    .command('get <id>')
    .description('Get feed log details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching feed log...');

      try {
        const log = await getFeedLog(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: feedFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch feed log');
        error(formatError(err));
        process.exit(1);
      }
    });

  feed
    .command('last')
    .description('Get most recent feed log')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { baby: string; output?: string }) => {
      const spin = spinner('Fetching last feed log...');

      try {
        const logs = await getFeedLogs({ babyId: opts.baby });
        spin.stop();

        if (logs.length === 0) {
          console.log('No feed logs found.');
          return;
        }

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(logs[0], {
          format: format as OutputFormat,
          fields: feedFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch last feed log');
        error(formatError(err));
        process.exit(1);
      }
    });

  feed
    .command('create')
    .description('Create a feed log')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--type <type>', 'Feed type (BREAST, BOTTLE, SOLIDS)')
    .option('--time <time>', 'Time (ISO8601, default: now)')
    .option('--amount <amount>', 'Amount')
    .option('--unit <unit>', 'Unit abbreviation (e.g., OZ, ML)')
    .option('--side <side>', 'Breast side (LEFT, RIGHT)')
    .option('--duration <seconds>', 'Feed duration in seconds')
    .option('--food <description>', 'Food description (for solids)')
    .option('--bottle-type <type>', 'Bottle type (formula, breast milk, etc.)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      type: string;
      time?: string;
      amount?: string;
      unit?: string;
      side?: string;
      duration?: string;
      food?: string;
      bottleType?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating feed log...');

      try {
        const data: FeedLogCreate = {
          babyId: opts.baby,
          time: opts.time || now(),
          type: validateFeedType(opts.type),
        };

        if (opts.amount) data.amount = optionalNumber(opts.amount);
        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.side) data.side = validateBreastSide(opts.side);
        if (opts.duration) data.feedDuration = optionalNumber(opts.duration);
        if (opts.food) data.food = opts.food;
        if (opts.bottleType) data.bottleType = opts.bottleType;
        if (opts.notes) data.notes = opts.notes;

        const log = await createFeedLog(data);
        spin.succeed('Feed log created');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: feedFields,
        });
      } catch (err) {
        spin.fail('Failed to create feed log');
        error(formatError(err));
        process.exit(1);
      }
    });

  // Quick log commands
  const logCmd = feed
    .command('log')
    .description('Quick log feeding activities');

  logCmd
    .command('breast')
    .description('Quick log breastfeeding')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--side <side>', 'Breast side (LEFT, RIGHT)')
    .option('--duration <minutes>', 'Duration in minutes')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      side: string;
      duration?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging breastfeeding...');

      try {
        const babyId = getBabyId(opts);
        const data: FeedLogCreate = {
          babyId,
          time: now(),
          type: 'BREAST',
          side: validateBreastSide(opts.side),
        };

        if (opts.duration) {
          data.feedDuration = Math.round(parseFloat(opts.duration) * 60); // Convert minutes to seconds
        }
        if (opts.notes) data.notes = opts.notes;

        const log = await createFeedLog(data);
        spin.succeed(`Breastfeeding logged (${opts.side} side)`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: feedFields,
        });
      } catch (err) {
        spin.fail('Failed to log breastfeeding');
        error(formatError(err));
        process.exit(1);
      }
    });

  logCmd
    .command('bottle')
    .description('Quick log bottle feeding')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--amount <amount>', 'Amount')
    .option('--unit <unit>', 'Unit (uses server default if not specified)')
    .option('--type <type>', 'Bottle type (formula, breast milk, etc.)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      amount: string;
      unit?: string;
      type?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging bottle feeding...');

      try {
        const babyId = getBabyId(opts);
        const unit = opts.unit || getDefaultBottleUnit();
        const data: FeedLogCreate = {
          babyId,
          time: now(),
          type: 'BOTTLE',
          amount: optionalNumber(opts.amount),
          unitAbbr: unit,
        };

        if (opts.type) data.bottleType = opts.type;
        if (opts.notes) data.notes = opts.notes;

        const log = await createFeedLog(data);
        spin.succeed(`Bottle feeding logged (${opts.amount} ${unit})`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: feedFields,
        });
      } catch (err) {
        spin.fail('Failed to log bottle feeding');
        error(formatError(err));
        process.exit(1);
      }
    });

  logCmd
    .command('solids')
    .description('Quick log solid food feeding')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--food <description>', 'Food description')
    .option('--amount <amount>', 'Amount')
    .option('--unit <unit>', 'Unit (uses server default if not specified)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      food: string;
      amount?: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging solid food...');

      try {
        const babyId = getBabyId(opts);
        const data: FeedLogCreate = {
          babyId,
          time: now(),
          type: 'SOLIDS',
          food: opts.food,
        };

        if (opts.amount) {
          data.amount = optionalNumber(opts.amount);
          data.unitAbbr = opts.unit || getDefaultSolidsUnit();
        }
        if (opts.notes) data.notes = opts.notes;

        const log = await createFeedLog(data);
        spin.succeed(`Solid food logged: ${opts.food}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: feedFields,
        });
      } catch (err) {
        spin.fail('Failed to log solid food');
        error(formatError(err));
        process.exit(1);
      }
    });

  feed
    .command('update <id>')
    .description('Update a feed log')
    .option('--time <time>', 'Time (ISO8601)')
    .option('--amount <amount>', 'Amount')
    .option('--unit <unit>', 'Unit abbreviation')
    .option('--side <side>', 'Breast side (LEFT, RIGHT)')
    .option('--duration <seconds>', 'Feed duration in seconds')
    .option('--food <description>', 'Food description')
    .option('--bottle-type <type>', 'Bottle type')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      time?: string;
      amount?: string;
      unit?: string;
      side?: string;
      duration?: string;
      food?: string;
      bottleType?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating feed log...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.time) data.time = opts.time;
        if (opts.amount) data.amount = optionalNumber(opts.amount);
        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.side) data.side = validateBreastSide(opts.side);
        if (opts.duration) data.feedDuration = optionalNumber(opts.duration);
        if (opts.food) data.food = opts.food;
        if (opts.bottleType) data.bottleType = opts.bottleType;
        if (opts.notes) data.notes = opts.notes;

        const log = await updateFeedLog(id, data as any);
        spin.succeed('Feed log updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: feedFields,
        });
      } catch (err) {
        spin.fail('Failed to update feed log');
        error(formatError(err));
        process.exit(1);
      }
    });

  feed
    .command('delete <id>')
    .description('Delete a feed log')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this feed log?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting feed log...');
        await deleteFeedLog(id);
        spin.succeed('Feed log deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
