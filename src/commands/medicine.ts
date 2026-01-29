import { Command } from 'commander';
import {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../api/endpoints.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate } from '../utils/date.js';
import {
  requireString,
  optionalString,
  optionalNumber,
  parseBoolean,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat, MedicineCreate } from '../types/index.js';

const medicineColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'name', header: 'Name', width: 20 },
  { key: 'typicalDoseSize', header: 'Dose', width: 8 },
  { key: 'unitAbbr', header: 'Unit', width: 6 },
  { key: 'doseMinTime', header: 'Min Time', width: 10 },
  { key: 'active', header: 'Active', width: 8, formatter: (v) => v ? 'Yes' : 'No' },
];

const medicineFields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'typicalDoseSize', label: 'Typical Dose' },
  { key: 'unitAbbr', label: 'Unit' },
  { key: 'doseMinTime', label: 'Min Time Between Doses' },
  { key: 'notes', label: 'Notes' },
  { key: 'active', label: 'Active', formatter: (v: unknown) => v ? 'Yes' : 'No' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

export function registerMedicineCommands(program: Command): void {
  const medicine = program
    .command('medicine')
    .description('Manage medicines');

  medicine
    .command('list')
    .description('List medicines')
    .option('--active', 'Show only active medicines')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { active?: boolean; output?: string }) => {
      const spin = spinner('Fetching medicines...');

      try {
        const medicines = await getMedicines(opts.active ? { active: true } : undefined);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(medicines, {
          format: format as OutputFormat,
          columns: medicineColumns,
          plainFields: ['id', 'name', 'typicalDoseSize', 'unitAbbr', 'active'],
        });
      } catch (err) {
        spin.fail('Failed to fetch medicines');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicine
    .command('get <id>')
    .description('Get medicine details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching medicine...');

      try {
        const med = await getMedicine(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(med, {
          format: format as OutputFormat,
          fields: medicineFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch medicine');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicine
    .command('create')
    .description('Create a new medicine')
    .requiredOption('--name <name>', 'Medicine name')
    .option('--dose-size <size>', 'Typical dose size')
    .option('--unit <unit>', 'Unit abbreviation (e.g., ML, MG)')
    .option('--min-time <time>', 'Minimum time between doses (HH:MM)')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      name: string;
      doseSize?: string;
      unit?: string;
      minTime?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating medicine...');

      try {
        const data: MedicineCreate = {
          name: requireString(opts.name, 'Name'),
        };

        if (opts.doseSize) data.typicalDoseSize = optionalNumber(opts.doseSize);
        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.minTime) data.doseMinTime = opts.minTime;
        if (opts.notes) data.notes = opts.notes;

        const med = await createMedicine(data);
        spin.succeed(`Medicine created: ${med.name}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(med, {
          format: format as OutputFormat,
          fields: medicineFields,
        });
      } catch (err) {
        spin.fail('Failed to create medicine');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicine
    .command('update <id>')
    .description('Update a medicine')
    .option('--name <name>', 'Medicine name')
    .option('--dose-size <size>', 'Typical dose size')
    .option('--unit <unit>', 'Unit abbreviation')
    .option('--min-time <time>', 'Minimum time between doses (HH:MM)')
    .option('--notes <text>', 'Notes')
    .option('--active <bool>', 'Active status')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      name?: string;
      doseSize?: string;
      unit?: string;
      minTime?: string;
      notes?: string;
      active?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating medicine...');

      try {
        const data: Record<string, unknown> = { id };

        if (opts.name) data.name = opts.name;
        if (opts.doseSize) data.typicalDoseSize = optionalNumber(opts.doseSize);
        if (opts.unit) data.unitAbbr = opts.unit;
        if (opts.minTime) data.doseMinTime = opts.minTime;
        if (opts.notes) data.notes = opts.notes;
        if (opts.active !== undefined) data.active = parseBoolean(opts.active);

        const med = await updateMedicine(data as any);
        spin.succeed(`Medicine updated: ${med.name}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(med, {
          format: format as OutputFormat,
          fields: medicineFields,
        });
      } catch (err) {
        spin.fail('Failed to update medicine');
        error(formatError(err));
        process.exit(1);
      }
    });

  medicine
    .command('delete <id>')
    .description('Delete a medicine')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this medicine?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting medicine...');
        await deleteMedicine(id);
        spin.succeed('Medicine deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
