import { Command } from 'commander';
import {
  getBabies,
  getBaby,
  createBaby,
  updateBaby,
  deleteBaby,
} from '../api/endpoints.js';
import {
  setDefaultBabyId,
  getDefaultBabyId,
  clearDefaultBabyId,
} from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate } from '../utils/date.js';
import {
  requireString,
  optionalString,
  parseBoolean,
  validateGender,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat, BabyResponse } from '../types/index.js';

const babyColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'firstName', header: 'First Name', width: 15 },
  { key: 'lastName', header: 'Last Name', width: 15 },
  { key: 'birthDate', header: 'Birth Date', width: 12, formatter: (v) => formatDate(v as string, 'yyyy-MM-dd') },
  { key: 'gender', header: 'Gender', width: 8 },
  { key: 'inactive', header: 'Active', width: 8, formatter: (v) => v ? 'No' : 'Yes' },
];

const babyFields = [
  { key: 'id', label: 'ID' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'birthDate', label: 'Birth Date', formatter: (v: unknown) => formatDate(v as string, 'yyyy-MM-dd') },
  { key: 'gender', label: 'Gender' },
  { key: 'inactive', label: 'Active', formatter: (v: unknown) => v ? 'No' : 'Yes' },
  { key: 'feedWarningTime', label: 'Feed Warning' },
  { key: 'diaperWarningTime', label: 'Diaper Warning' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

export function registerBabyCommands(program: Command): void {
  const baby = program
    .command('baby')
    .description('Manage babies');

  baby
    .command('list')
    .description('List all babies')
    .option('--active', 'Show only active babies')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { active?: boolean; output?: string }) => {
      const spin = spinner('Fetching babies...');

      try {
        let babies = await getBabies();

        if (opts.active) {
          babies = babies.filter((b: BabyResponse) => !b.inactive);
        }

        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(babies, {
          format: format as OutputFormat,
          columns: babyColumns,
          plainFields: ['id', 'firstName', 'lastName', 'birthDate'],
        });

        // Show default baby if set
        const defaultId = getDefaultBabyId();
        if (defaultId) {
          const defaultBaby = babies.find((b: BabyResponse) => b.id === defaultId);
          if (defaultBaby) {
            console.log(`\nDefault baby: ${defaultBaby.firstName} ${defaultBaby.lastName}`);
          }
        }
      } catch (err) {
        spin.fail('Failed to fetch babies');
        error(formatError(err));
        process.exit(1);
      }
    });

  baby
    .command('get <id>')
    .description('Get baby details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching baby...');

      try {
        const babyData = await getBaby(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(babyData, {
          format: format as OutputFormat,
          fields: babyFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch baby');
        error(formatError(err));
        process.exit(1);
      }
    });

  baby
    .command('create')
    .description('Create a new baby')
    .requiredOption('--first-name <name>', 'First name')
    .requiredOption('--birth-date <date>', 'Birth date (YYYY-MM-DD)')
    .option('--last-name <name>', 'Last name')
    .option('--gender <gender>', 'Gender (MALE or FEMALE)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      firstName: string;
      birthDate: string;
      lastName?: string;
      gender?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating baby...');

      try {
        const data = {
          firstName: requireString(opts.firstName, 'First name'),
          lastName: optionalString(opts.lastName) || '',
          birthDate: opts.birthDate,
          gender: opts.gender ? validateGender(opts.gender) : undefined,
        };

        const babyData = await createBaby(data);
        spin.succeed(`Baby created: ${babyData.firstName} ${babyData.lastName}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(babyData, {
          format: format as OutputFormat,
          fields: babyFields,
        });
      } catch (err) {
        spin.fail('Failed to create baby');
        error(formatError(err));
        process.exit(1);
      }
    });

  baby
    .command('update <id>')
    .description('Update baby information')
    .option('--first-name <name>', 'First name')
    .option('--last-name <name>', 'Last name')
    .option('--birth-date <date>', 'Birth date (YYYY-MM-DD)')
    .option('--gender <gender>', 'Gender (MALE or FEMALE)')
    .option('--inactive <bool>', 'Set inactive status')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      firstName?: string;
      lastName?: string;
      birthDate?: string;
      gender?: string;
      inactive?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating baby...');

      try {
        const data: Record<string, unknown> = { id };

        if (opts.firstName) data.firstName = opts.firstName;
        if (opts.lastName) data.lastName = opts.lastName;
        if (opts.birthDate) data.birthDate = opts.birthDate;
        if (opts.gender) data.gender = validateGender(opts.gender);
        if (opts.inactive !== undefined) data.inactive = parseBoolean(opts.inactive);

        const babyData = await updateBaby(data as any);
        spin.succeed(`Baby updated: ${babyData.firstName} ${babyData.lastName}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(babyData, {
          format: format as OutputFormat,
          fields: babyFields,
        });
      } catch (err) {
        spin.fail('Failed to update baby');
        error(formatError(err));
        process.exit(1);
      }
    });

  baby
    .command('delete <id>')
    .description('Delete a baby')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this baby? This cannot be undone.',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting baby...');
        await deleteBaby(id);

        // Clear default baby if it was deleted
        if (getDefaultBabyId() === id) {
          clearDefaultBabyId();
        }

        spin.succeed('Baby deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });

  baby
    .command('select <id>')
    .description('Set default baby for quick commands')
    .action(async (id: string) => {
      const spin = spinner('Setting default baby...');

      try {
        const babyData = await getBaby(id);
        setDefaultBabyId(id);
        spin.succeed(`Default baby set to: ${babyData.firstName} ${babyData.lastName}`);
      } catch (err) {
        spin.fail('Failed to set default baby');
        error(formatError(err));
        process.exit(1);
      }
    });

  baby
    .command('unselect')
    .description('Clear default baby selection')
    .action(() => {
      clearDefaultBabyId();
      success('Default baby cleared');
    });
}
