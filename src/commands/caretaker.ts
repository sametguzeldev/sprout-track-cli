import { Command } from 'commander';
import {
  getCaretakers,
  getCaretaker,
  createCaretaker,
  updateCaretaker,
  deleteCaretaker,
} from '../api/endpoints.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate } from '../utils/date.js';
import {
  requireString,
  parseBoolean,
  validatePin,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat, CaretakerCreate } from '../types/index.js';

const caretakerColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'loginId', header: 'Login ID', width: 10 },
  { key: 'name', header: 'Name', width: 20 },
  { key: 'type', header: 'Type', width: 15 },
  { key: 'role', header: 'Role', width: 8 },
  { key: 'inactive', header: 'Active', width: 8, formatter: (v) => v ? 'No' : 'Yes' },
];

const caretakerFields = [
  { key: 'id', label: 'ID' },
  { key: 'loginId', label: 'Login ID' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'role', label: 'Role' },
  { key: 'inactive', label: 'Active', formatter: (v: unknown) => v ? 'No' : 'Yes' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

export function registerCaretakerCommands(program: Command): void {
  const caretaker = program
    .command('caretaker')
    .description('Manage caretakers');

  caretaker
    .command('list')
    .description('List all caretakers')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { output?: string }) => {
      const spin = spinner('Fetching caretakers...');

      try {
        const caretakers = await getCaretakers();
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(caretakers, {
          format: format as OutputFormat,
          columns: caretakerColumns,
          plainFields: ['id', 'loginId', 'name', 'type', 'role'],
        });
      } catch (err) {
        spin.fail('Failed to fetch caretakers');
        error(formatError(err));
        process.exit(1);
      }
    });

  caretaker
    .command('get <id>')
    .description('Get caretaker details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching caretaker...');

      try {
        const c = await getCaretaker(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(c, {
          format: format as OutputFormat,
          fields: caretakerFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch caretaker');
        error(formatError(err));
        process.exit(1);
      }
    });

  caretaker
    .command('create')
    .description('Create a new caretaker')
    .requiredOption('--name <name>', 'Caretaker name')
    .requiredOption('--login-id <id>', 'Login ID (2-digit identifier)')
    .requiredOption('--pin <pin>', 'Security PIN')
    .option('--type <type>', 'Type (parent, nanny, grandparent, etc.)')
    .option('--role <role>', 'Role (USER or ADMIN, default: USER)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      name: string;
      loginId: string;
      pin: string;
      type?: string;
      role?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating caretaker...');

      try {
        const data: CaretakerCreate = {
          name: requireString(opts.name, 'Name'),
          loginId: opts.loginId,
          securityPin: validatePin(opts.pin),
        };

        if (opts.type) data.type = opts.type;
        if (opts.role) {
          const role = opts.role.toUpperCase();
          if (role !== 'USER' && role !== 'ADMIN') {
            throw new Error('Role must be USER or ADMIN');
          }
          data.role = role as 'USER' | 'ADMIN';
        }

        const c = await createCaretaker(data);
        spin.succeed(`Caretaker created: ${c.name}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(c, {
          format: format as OutputFormat,
          fields: caretakerFields,
        });
      } catch (err) {
        spin.fail('Failed to create caretaker');
        error(formatError(err));
        process.exit(1);
      }
    });

  caretaker
    .command('update <id>')
    .description('Update a caretaker')
    .option('--name <name>', 'Caretaker name')
    .option('--type <type>', 'Type')
    .option('--pin <pin>', 'Security PIN')
    .option('--inactive <bool>', 'Inactive status')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      name?: string;
      type?: string;
      pin?: string;
      inactive?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating caretaker...');

      try {
        const data: Record<string, unknown> = { id };

        if (opts.name) data.name = opts.name;
        if (opts.type) data.type = opts.type;
        if (opts.pin) data.securityPin = validatePin(opts.pin);
        if (opts.inactive !== undefined) data.inactive = parseBoolean(opts.inactive);

        const c = await updateCaretaker(data as any);
        spin.succeed(`Caretaker updated: ${c.name}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(c, {
          format: format as OutputFormat,
          fields: caretakerFields,
        });
      } catch (err) {
        spin.fail('Failed to update caretaker');
        error(formatError(err));
        process.exit(1);
      }
    });

  caretaker
    .command('delete <id>')
    .description('Delete a caretaker')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this caretaker?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting caretaker...');
        await deleteCaretaker(id);
        spin.succeed('Caretaker deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
