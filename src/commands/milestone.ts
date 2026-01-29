import { Command } from 'commander';
import {
  getMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, toDateOnly } from '../utils/date.js';
import {
  requireString,
  validateMilestoneCategory,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat, MilestoneCreate } from '../types/index.js';

const milestoneColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'date', header: 'Date', width: 12, formatter: (v) => toDateOnly(v as string) },
  { key: 'title', header: 'Title', width: 30 },
  { key: 'category', header: 'Category', width: 12 },
  { key: 'ageInDays', header: 'Age (days)', width: 10 },
];

const milestoneFields = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Date', formatter: (v: unknown) => toDateOnly(v as string) },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'ageInDays', label: 'Age (days)' },
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

export function registerMilestoneCommands(program: Command): void {
  const milestone = program
    .command('milestone')
    .description('Log and manage milestones');

  milestone
    .command('list')
    .description('List milestones')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .option('--category <category>', 'Filter by category (MOTOR, COGNITIVE, SOCIAL, LANGUAGE, CUSTOM)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      category?: string;
      output?: string;
    }) => {
      const spin = spinner('Fetching milestones...');

      try {
        const params: Record<string, unknown> = { babyId: opts.baby };
        if (opts.category) params.category = validateMilestoneCategory(opts.category);

        const milestones = await getMilestones(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(milestones, {
          format: format as OutputFormat,
          columns: milestoneColumns,
          plainFields: ['id', 'date', 'title', 'category'],
        });
      } catch (err) {
        spin.fail('Failed to fetch milestones');
        error(formatError(err));
        process.exit(1);
      }
    });

  milestone
    .command('get <id>')
    .description('Get milestone details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching milestone...');

      try {
        const m = await getMilestone(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: milestoneFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch milestone');
        error(formatError(err));
        process.exit(1);
      }
    });

  milestone
    .command('create')
    .description('Create a milestone')
    .requiredOption('-b, --baby <id>', 'Baby ID')
    .requiredOption('--title <title>', 'Milestone title')
    .requiredOption('--category <category>', 'Category (MOTOR, COGNITIVE, SOCIAL, LANGUAGE, CUSTOM)')
    .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
    .option('--description <text>', 'Description')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby: string;
      title: string;
      category: string;
      date?: string;
      description?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating milestone...');

      try {
        const data: MilestoneCreate = {
          babyId: opts.baby,
          date: opts.date || getTodayDate(),
          title: requireString(opts.title, 'Title'),
          category: validateMilestoneCategory(opts.category),
        };

        if (opts.description) data.description = opts.description;

        const m = await createMilestone(data);
        spin.succeed(`Milestone created: ${m.title}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: milestoneFields,
        });
      } catch (err) {
        spin.fail('Failed to create milestone');
        error(formatError(err));
        process.exit(1);
      }
    });

  milestone
    .command('update <id>')
    .description('Update a milestone')
    .option('--title <title>', 'Milestone title')
    .option('--description <text>', 'Description')
    .option('--category <category>', 'Category')
    .option('--date <date>', 'Date (YYYY-MM-DD)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      title?: string;
      description?: string;
      category?: string;
      date?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating milestone...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.title) data.title = opts.title;
        if (opts.description) data.description = opts.description;
        if (opts.category) data.category = validateMilestoneCategory(opts.category);
        if (opts.date) data.date = opts.date;

        const m = await updateMilestone(id, data as any);
        spin.succeed(`Milestone updated: ${m.title}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(m, {
          format: format as OutputFormat,
          fields: milestoneFields,
        });
      } catch (err) {
        spin.fail('Failed to update milestone');
        error(formatError(err));
        process.exit(1);
      }
    });

  milestone
    .command('delete <id>')
    .description('Delete a milestone')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this milestone?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting milestone...');
        await deleteMilestone(id);
        spin.succeed('Milestone deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
