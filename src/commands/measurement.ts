import { Command } from 'commander';
import {
  getMeasurements,
  getMeasurement,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../api/endpoints.js';
import { getDefaultBabyId, getDefaultHeightUnit, getDefaultWeightUnit, getDefaultTempUnit } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, toDateOnly } from '../utils/date.js';
import {
  requireNumber,
  optionalNumber,
  validateMeasurementType,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, MeasurementCreate } from '../types/index.js';

const measurementColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'date', header: 'Date', width: 12, formatter: (v) => toDateOnly(v as string) },
  { key: 'type', header: 'Type', width: 20 },
  { key: 'value', header: 'Value', width: 8 },
  { key: 'unit', header: 'Unit', width: 6 },
];

const measurementFields = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Date', formatter: (v: unknown) => toDateOnly(v as string) },
  { key: 'type', label: 'Type' },
  { key: 'value', label: 'Value' },
  { key: 'unit', label: 'Unit' },
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

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function registerMeasurementCommands(program: Command): void {
  const measurement = program
    .command('measurement')
    .description('Log and manage measurements');

  measurement
    .command('list')
    .description('List measurements')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .option('--type <type>', 'Filter by type (HEIGHT, WEIGHT, HEAD_CIRCUMFERENCE, TEMPERATURE)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      type?: string;
      output?: string;
    }) => {
      const spin = spinner('Fetching measurements...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.type) params.type = validateMeasurementType(opts.type);

        const measurements = await getMeasurements(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(measurements, {
          format: format as OutputFormat,
          columns: measurementColumns,
          plainFields: ['id', 'date', 'type', 'value', 'unit'],
        });
      } catch (err) {
        spin.fail('Failed to fetch measurements');
        error(formatError(err));
        process.exit(1);
      }
    });

  measurement
    .command('get <id>')
    .description('Get measurement details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching measurement...');

      try {
        const m = await getMeasurement(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: measurementFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch measurement');
        error(formatError(err));
        process.exit(1);
      }
    });

  measurement
    .command('create')
    .description('Create a measurement')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--type <type>', 'Measurement type (HEIGHT, WEIGHT, HEAD_CIRCUMFERENCE, TEMPERATURE)')
    .requiredOption('--value <value>', 'Measurement value')
    .requiredOption('--unit <unit>', 'Unit (IN, CM, LB, KG, F, C)')
    .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      type: string;
      value: string;
      unit: string;
      date?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating measurement...');

      try {
        const data: MeasurementCreate = {
          babyId: opts.baby,
          date: opts.date || getTodayDate(),
          type: validateMeasurementType(opts.type),
          value: requireNumber(opts.value, 'Value'),
          unit: opts.unit.toUpperCase(),
        };

        if (opts.notes) data.notes = opts.notes;

        const m = await createMeasurement(data);
        spin.succeed(`Measurement created: ${m.value} ${m.unit}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: measurementFields,
        });
      } catch (err) {
        spin.fail('Failed to create measurement');
        error(formatError(err));
        process.exit(1);
      }
    });

  // Quick log commands
  const logCmd = measurement
    .command('log')
    .description('Quick log measurements');

  logCmd
    .command('height')
    .description('Quick log height measurement')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--value <value>', 'Height value')
    .option('--unit <unit>', 'Unit (uses server default if not specified)')
    .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      value: string;
      unit?: string;
      date?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging height...');

      try {
        const babyId = getBabyId(opts);
        const unit = opts.unit?.toUpperCase() || getDefaultHeightUnit();
        const data: MeasurementCreate = {
          babyId,
          date: opts.date || getTodayDate(),
          type: 'HEIGHT',
          value: requireNumber(opts.value, 'Value'),
          unit,
        };

        if (opts.notes) data.notes = opts.notes;

        const m = await createMeasurement(data);
        spin.succeed(`Height logged: ${m.value} ${m.unit}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: measurementFields,
        });
      } catch (err) {
        spin.fail('Failed to log height');
        error(formatError(err));
        process.exit(1);
      }
    });

  logCmd
    .command('weight')
    .description('Quick log weight measurement')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--value <value>', 'Weight value')
    .option('--unit <unit>', 'Unit (uses server default if not specified)')
    .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      value: string;
      unit?: string;
      date?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging weight...');

      try {
        const babyId = getBabyId(opts);
        const unit = opts.unit?.toUpperCase() || getDefaultWeightUnit();
        const data: MeasurementCreate = {
          babyId,
          date: opts.date || getTodayDate(),
          type: 'WEIGHT',
          value: requireNumber(opts.value, 'Value'),
          unit,
        };

        if (opts.notes) data.notes = opts.notes;

        const m = await createMeasurement(data);
        spin.succeed(`Weight logged: ${m.value} ${m.unit}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: measurementFields,
        });
      } catch (err) {
        spin.fail('Failed to log weight');
        error(formatError(err));
        process.exit(1);
      }
    });

  logCmd
    .command('head')
    .description('Quick log head circumference measurement')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--value <value>', 'Measurement value')
    .option('--unit <unit>', 'Unit (uses server default if not specified)')
    .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      value: string;
      unit?: string;
      date?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging head circumference...');

      try {
        const babyId = getBabyId(opts);
        const unit = opts.unit?.toUpperCase() || getDefaultHeightUnit();
        const data: MeasurementCreate = {
          babyId,
          date: opts.date || getTodayDate(),
          type: 'HEAD_CIRCUMFERENCE',
          value: requireNumber(opts.value, 'Value'),
          unit,
        };

        if (opts.notes) data.notes = opts.notes;

        const m = await createMeasurement(data);
        spin.succeed(`Head circumference logged: ${m.value} ${m.unit}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: measurementFields,
        });
      } catch (err) {
        spin.fail('Failed to log head circumference');
        error(formatError(err));
        process.exit(1);
      }
    });

  logCmd
    .command('temp')
    .description('Quick log temperature measurement')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--value <value>', 'Temperature value')
    .option('--unit <unit>', 'Unit (uses server default if not specified)')
    .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      value: string;
      unit?: string;
      date?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging temperature...');

      try {
        const babyId = getBabyId(opts);
        const unit = opts.unit?.toUpperCase() || getDefaultTempUnit();
        const data: MeasurementCreate = {
          babyId,
          date: opts.date || getTodayDate(),
          type: 'TEMPERATURE',
          value: requireNumber(opts.value, 'Value'),
          unit,
        };

        if (opts.notes) data.notes = opts.notes;

        const m = await createMeasurement(data);
        spin.succeed(`Temperature logged: ${m.value}°${m.unit}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: measurementFields,
        });
      } catch (err) {
        spin.fail('Failed to log temperature');
        error(formatError(err));
        process.exit(1);
      }
    });

  measurement
    .command('update <id>')
    .description('Update a measurement')
    .option('--date <date>', 'Date (YYYY-MM-DD)')
    .option('--type <type>', 'Measurement type')
    .option('--value <value>', 'Measurement value')
    .option('--unit <unit>', 'Unit')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      date?: string;
      type?: string;
      value?: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating measurement...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.date) data.date = opts.date;
        if (opts.type) data.type = validateMeasurementType(opts.type);
        if (opts.value) data.value = optionalNumber(opts.value);
        if (opts.unit) data.unit = opts.unit.toUpperCase();
        if (opts.notes) data.notes = opts.notes;

        const m = await updateMeasurement(id, data as any);
        spin.succeed('Measurement updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: measurementFields,
        });
      } catch (err) {
        spin.fail('Failed to update measurement');
        error(formatError(err));
        process.exit(1);
      }
    });

  measurement
    .command('delete <id>')
    .description('Delete a measurement')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this measurement?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting measurement...');
        await deleteMeasurement(id);
        spin.succeed('Measurement deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
