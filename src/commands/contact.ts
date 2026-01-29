import { Command } from 'commander';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../api/endpoints.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate } from '../utils/date.js';
import {
  requireString,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat, ContactCreate } from '../types/index.js';

const contactColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'name', header: 'Name', width: 25 },
  { key: 'role', header: 'Role', width: 15 },
  { key: 'phone', header: 'Phone', width: 15 },
  { key: 'email', header: 'Email', width: 25 },
];

const contactFields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'notes', label: 'Notes' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

export function registerContactCommands(program: Command): void {
  const contact = program
    .command('contact')
    .description('Manage contacts');

  contact
    .command('list')
    .description('List all contacts')
    .option('--role <role>', 'Filter by role')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { role?: string; output?: string }) => {
      const spin = spinner('Fetching contacts...');

      try {
        const contacts = await getContacts(opts.role ? { role: opts.role } : undefined);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(contacts, {
          format: format as OutputFormat,
          columns: contactColumns,
          plainFields: ['id', 'name', 'role', 'phone', 'email'],
        });
      } catch (err) {
        spin.fail('Failed to fetch contacts');
        error(formatError(err));
        process.exit(1);
      }
    });

  contact
    .command('get <id>')
    .description('Get contact details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching contact...');

      try {
        const c = await getContact(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(c, {
          format: format as OutputFormat,
          fields: contactFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch contact');
        error(formatError(err));
        process.exit(1);
      }
    });

  contact
    .command('create')
    .description('Create a new contact')
    .requiredOption('--name <name>', 'Contact name')
    .requiredOption('--role <role>', 'Role (doctor, teacher, etc.)')
    .option('--phone <phone>', 'Phone number')
    .option('--email <email>', 'Email address')
    .option('--address <address>', 'Address')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      name: string;
      role: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating contact...');

      try {
        const data: ContactCreate = {
          name: requireString(opts.name, 'Name'),
          role: requireString(opts.role, 'Role'),
        };

        if (opts.phone) data.phone = opts.phone;
        if (opts.email) data.email = opts.email;
        if (opts.address) data.address = opts.address;
        if (opts.notes) data.notes = opts.notes;

        const c = await createContact(data);
        spin.succeed(`Contact created: ${c.name}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(c, {
          format: format as OutputFormat,
          fields: contactFields,
        });
      } catch (err) {
        spin.fail('Failed to create contact');
        error(formatError(err));
        process.exit(1);
      }
    });

  contact
    .command('update <id>')
    .description('Update a contact')
    .option('--name <name>', 'Contact name')
    .option('--role <role>', 'Role')
    .option('--phone <phone>', 'Phone number')
    .option('--email <email>', 'Email address')
    .option('--address <address>', 'Address')
    .option('--notes <text>', 'Notes')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      name?: string;
      role?: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating contact...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.name) data.name = opts.name;
        if (opts.role) data.role = opts.role;
        if (opts.phone) data.phone = opts.phone;
        if (opts.email) data.email = opts.email;
        if (opts.address) data.address = opts.address;
        if (opts.notes) data.notes = opts.notes;

        const c = await updateContact(id, data as any);
        spin.succeed(`Contact updated: ${c.name}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(c, {
          format: format as OutputFormat,
          fields: contactFields,
        });
      } catch (err) {
        spin.fail('Failed to update contact');
        error(formatError(err));
        process.exit(1);
      }
    });

  contact
    .command('delete <id>')
    .description('Delete a contact')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this contact?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting contact...');
        await deleteContact(id);
        spin.succeed('Contact deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
