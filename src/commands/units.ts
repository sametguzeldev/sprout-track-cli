import { Command } from 'commander';
import { getUnits } from '../api/endpoints.js';
import { error, spinner, output, type TableColumn } from '../output/index.js';
import { validateOutputFormat } from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat } from '../types/index.js';

const unitColumns: TableColumn[] = [
  { key: 'unitAbbr', header: 'Abbreviation', width: 15 },
  { key: 'unitName', header: 'Name', width: 30 },
  { key: 'activityTypes', header: 'Activity Types', width: 40 },
];

const unitFields = [
  { key: 'id', label: 'ID' },
  { key: 'unitAbbr', label: 'Abbreviation' },
  { key: 'unitName', label: 'Name' },
  { key: 'activityTypes', label: 'Activity Types' },
];

export function registerUnitsCommands(program: Command): void {
  program
    .command('units')
    .description('List available units')
    .option('--activity <type>', 'Filter by activity type (feed, pump, measurement)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { activity?: string; output?: string }) => {
      const spin = spinner('Fetching units...');

      try {
        const params = opts.activity ? { activityType: opts.activity } : undefined;
        const units = await getUnits(params);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(units, {
          format: format as OutputFormat,
          columns: unitColumns,
          plainFields: ['unitAbbr', 'unitName', 'activityTypes'],
        });
      } catch (err) {
        spin.fail('Failed to fetch units');
        error(formatError(err));
        process.exit(1);
      }
    });
}
