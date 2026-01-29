import { Command } from 'commander';
import {
  getMedicineLogs,
  getMedicineLog,
  createMedicineLog,
  updateMedicineLog,
  deleteMedicineLog,
} from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, now } from '../utils/date.js';
import {
  requireString,
  requireNumber,
  optionalString,
  optionalNumber,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, MedicineLogCreate } from '../types/index.js';

const medicineLogColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'time', header: 'Time', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'medicineId', header: 'Medicine ID', width: 38 },
  { key: 'doseAmount', header: 'Dose', width: 8 },
  { key: 'unitAbbr', header: 'Unit', width: 6 },
];

const medicineLogFields = [
  { key: 'id', label: 'ID' },
  { key: 'time', label: 'Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'medicineId', label: 'Medicine ID' },
  { key: 'doseAmount', label: 'Dose Amount' },
  { key: 'unitAbbr', label: 'Unit' },
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

export function registerMedicineLogCommands(program: Command): void {
  const medicineLog = program
    .command('medicine-log')
    .description('Log medicine administration');

  medicineLog
    .command('list')
    .description('List medicine logs')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .option('--medicine <id>', 'Filter by medicine ID')
    .option('--start <date>', 'Start date (ISO8601 or YYYY-MM-DD)')
    .option('--end <date>', 'End date (ISO8601 or YYYY-MM-DD)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      medicine?: string;
      start?: string;
      end?: string;
      output?: string;
    }) => {
      const spin = spinner('Fetching medicine logs...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.medicine) params.medicineId = opts.medicine;
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const logs = await getMedicineLogs(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(logs, {
          format: format as OutputFormat,
          columns: medicineLogColumns,
          plainFields: ['id', 'time', 'medicineId', 'doseAmount', 'unitAbbr'],
        });
      } catch (err) {
        spin.fail('Failed to fetch medicine logs');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicineLog
    .command('get <id>')
    .description('Get medicine log details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching medicine log...');

      try {
        const log = await getMedicineLog(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: medicineLogFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch medicine log');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicineLog
    .command('create')
    .description('Create a medicine log')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--medicine <id>', 'Medicine ID')
    .requiredOption('--dose <amount>', 'Dose amount')
    .option('--time <time>', 'Time (ISO8601, default: now)')
    .option('--unit <unit>', 'Unit abbreviation')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      medicine: string;
      dose: string;
      time?: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating medicine log...');

      try {
        const data: MedicineLogCreate = {
          babyId: opts.baby,
          medicineId: opts.medicine,
          time: opts.time || now(),
          doseAmount: requireNumber(opts.dose, 'Dose'),
        };

        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.notes) data.notes = opts.notes;

        const log = await createMedicineLog(data);
        spin.succeed('Medicine log created');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: medicineLogFields,
        });
      } catch (err) {
        spin.fail('Failed to create medicine log');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicineLog
    .command('log')
    .description('Quick log medicine administration')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .requiredOption('--medicine <id>', 'Medicine ID')
    .requiredOption('--dose <amount>', 'Dose amount')
    .option('--unit <unit>', 'Unit abbreviation')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      medicine: string;
      dose: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Logging medicine...');

      try {
        const babyId = getBabyId(opts);
        const data: MedicineLogCreate = {
          babyId,
          medicineId: opts.medicine,
          time: now(),
          doseAmount: requireNumber(opts.dose, 'Dose'),
        };

        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.notes) data.notes = opts.notes;

        const log = await createMedicineLog(data);
        spin.succeed(`Medicine logged (${opts.dose} ${opts.unit || ''})`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: medicineLogFields,
        });
      } catch (err) {
        spin.fail('Failed to log medicine');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicineLog
    .command('update <id>')
    .description('Update a medicine log')
    .option('--time <time>', 'Time (ISO8601)')
    .option('--dose <amount>', 'Dose amount')
    .option('--unit <unit>', 'Unit abbreviation')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      time?: string;
      dose?: string;
      unit?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating medicine log...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.time) data.time = opts.time;
        if (opts.dose) data.doseAmount = optionalNumber(opts.dose);
        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.notes) data.notes = opts.notes;

        const log = await updateMedicineLog(id, data as any);
        spin.succeed('Medicine log updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(log, {
          format: format as OutputFormat,
          fields: medicineLogFields,
        });
      } catch (err) {
        spin.fail('Failed to update medicine log');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicineLog
    .command('delete <id>')
    .description('Delete a medicine log')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this medicine log?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting medicine log...');
        await deleteMedicineLog(id);
        spin.succeed('Medicine log deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
