import { Command } from 'commander';
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { success, error, spinner, output, type TableColumn, truncate } from '../output/index.js';
import { formatDate, now } from '../utils/date.js';
import {
  requireString,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, NoteCreate } from '../types/index.js';

const noteColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'time', header: 'Time', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'category', header: 'Category', width: 15 },
  { key: 'content', header: 'Content', width: 40, formatter: (v) => truncate(v as string, 37) },
];

const noteFields = [
  { key: 'id', label: 'ID' },
  { key: 'time', label: 'Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'category', label: 'Category' },
  { key: 'content', label: 'Content' },
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

export function registerNoteCommands(program: Command): void {
  const note = program
    .command('note')
    .description('Log and manage notes');

  note
    .command('list')
    .description('List notes')
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
      const spin = spinner('Fetching notes...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const notes = await getNotes(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(notes, {
          format: format as OutputFormat,
          columns: noteColumns,
          plainFields: ['id', 'time', 'category', 'content'],
        });
      } catch (err) {
        spin.fail('Failed to fetch notes');
        error(formatError(err));
        process.exit(1);
      }
    });

  note
    .command('get <id>')
    .description('Get note details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching note...');

      try {
        const n = await getNote(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(n, {
          format: format as OutputFormat,
          fields: noteFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch note');
        error(formatError(err));
        process.exit(1);
      }
    });

  note
    .command('create')
    .description('Create a note')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--content <text>', 'Note content')
    .option('--time <time>', 'Time (ISO8601, default: now)')
    .option('--category <category>', 'Category')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      content: string;
      time?: string;
      category?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating note...');

      try {
        const data: NoteCreate = {
          babyId: opts.baby,
          time: opts.time || now(),
          content: requireString(opts.content, 'Content'),
        };

        if (opts.category) data.category = opts.category;

        const n = await createNote(data);
        spin.succeed('Note created');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(n, {
          format: format as OutputFormat,
          fields: noteFields,
        });
      } catch (err) {
        spin.fail('Failed to create note');
        error(formatError(err));
        process.exit(1);
      }
    });

  note
    .command('add <content>')
    .description('Quick add a note')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('--category <category>', 'Category')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (content: string, opts: {
      baby?: string;
      category?: string;
      output?: string;
    }) => {
      const spin = spinner('Adding note...');

      try {
        const babyId = getBabyId(opts);
        const data: NoteCreate = {
          babyId,
          time: now(),
          content: requireString(content, 'Content'),
        };

        if (opts.category) data.category = opts.category;

        const n = await createNote(data);
        spin.succeed('Note added');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(n, {
          format: format as OutputFormat,
          fields: noteFields,
        });
      } catch (err) {
        spin.fail('Failed to add note');
        error(formatError(err));
        process.exit(1);
      }
    });

  note
    .command('update <id>')
    .description('Update a note')
    .option('--content <text>', 'Note content')
    .option('--time <time>', 'Time (ISO8601)')
    .option('--category <category>', 'Category')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      content?: string;
      time?: string;
      category?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating note...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.content) data.content = opts.content;
        if (opts.time) data.time = opts.time;
        if (opts.category) data.category = opts.category;

        const n = await updateNote(id, data as any);
        spin.succeed('Note updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(n, {
          format: format as OutputFormat,
          fields: noteFields,
        });
      } catch (err) {
        spin.fail('Failed to update note');
        error(formatError(err));
        process.exit(1);
      }
    });

  note
    .command('delete <id>')
    .description('Delete a note')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this note?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting note...');
        await deleteNote(id);
        spin.succeed('Note deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
