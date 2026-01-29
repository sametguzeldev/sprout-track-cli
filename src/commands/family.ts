import { Command } from 'commander';
import { getFamily, updateFamily } from '../api/endpoints.js';
import { success, error, spinner, output } from '../output/index.js';
import { formatDate } from '../utils/date.js';
import { validateOutputFormat } from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat } from '../types/index.js';

const familyFields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'isActive', label: 'Active', formatter: (v: unknown) => v ? 'Yes' : 'No' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'updatedAt', label: 'Updated', formatter: (v: unknown) => formatDate(v as string) },
];

export function registerFamilyCommands(program: Command): void {
  const family = program
    .command('family')
    .description('Manage family information');

  family
    .command('get')
    .description('Get family information')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { output?: string }) => {
      const spin = spinner('Fetching family...');

      try {
        const f = await getFamily();
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(f, {
          format: format as OutputFormat,
          fields: familyFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch family');
        error(formatError(err));
        process.exit(1);
      }
    });

  family
    .command('update')
    .description('Update family information')
    .option('--name <name>', 'Family name')
    .option('--slug <slug>', 'Family slug (URL-friendly identifier)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      name?: string;
      slug?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating family...');

      try {
        const data: Record<string, string> = {};

        if (opts.name) data.name = opts.name;
        if (opts.slug) data.slug = opts.slug;

        if (Object.keys(data).length === 0) {
          spin.stop();
          error('No fields specified to update');
          process.exit(1);
        }

        const f = await updateFamily(data);
        spin.succeed(`Family updated: ${f.name}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(f, {
          format: format as OutputFormat,
          fields: familyFields,
        });
      } catch (err) {
        spin.fail('Failed to update family');
        error(formatError(err));
        process.exit(1);
      }
    });
}
