import { Command } from 'commander';
import { getSettings, updateSettings } from '../api/endpoints.js';
import { setCachedSettings, getCachedSettings } from '../config/store.js';
import { success, error, info, spinner, output } from '../output/index.js';
import { formatDate } from '../utils/date.js';
import { validateOutputFormat } from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat, SettingsUpdate, SettingsResponse } from '../types/index.js';

// Helper to cache settings locally
function cacheSettingsLocally(settings: SettingsResponse): void {
  setCachedSettings({
    defaultBottleUnit: settings.defaultBottleUnit,
    defaultSolidsUnit: settings.defaultSolidsUnit,
    defaultHeightUnit: settings.defaultHeightUnit,
    defaultWeightUnit: settings.defaultWeightUnit,
    defaultTempUnit: settings.defaultTempUnit,
  });
}

const settingsFields = [
  { key: 'id', label: 'ID' },
  { key: 'familyName', label: 'Family Name' },
  { key: 'authType', label: 'Auth Type' },
  { key: 'defaultBottleUnit', label: 'Bottle Unit' },
  { key: 'defaultSolidsUnit', label: 'Solids Unit' },
  { key: 'defaultHeightUnit', label: 'Height Unit' },
  { key: 'defaultWeightUnit', label: 'Weight Unit' },
  { key: 'defaultTempUnit', label: 'Temperature Unit' },
  { key: 'updatedAt', label: 'Last Updated', formatter: (v: unknown) => formatDate(v as string) },
];

export function registerSettingsCommands(program: Command): void {
  const settings = program
    .command('settings')
    .description('Manage family settings');

  settings
    .command('get')
    .description('Get current settings')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { output?: string }) => {
      const spin = spinner('Fetching settings...');

      try {
        const s = await getSettings();
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(s, {
          format: format as OutputFormat,
          fields: settingsFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch settings');
        error(formatError(err));
        process.exit(1);
      }
    });

  settings
    .command('set')
    .description('Update settings')
    .option('--family-name <name>', 'Family name')
    .option('--bottle-unit <unit>', 'Default bottle unit (OZ, ML)')
    .option('--solids-unit <unit>', 'Default solids unit (TBSP, etc.)')
    .option('--height-unit <unit>', 'Default height unit (IN, CM)')
    .option('--weight-unit <unit>', 'Default weight unit (LB, KG)')
    .option('--temp-unit <unit>', 'Default temperature unit (F, C)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      familyName?: string;
      bottleUnit?: string;
      solidsUnit?: string;
      heightUnit?: string;
      weightUnit?: string;
      tempUnit?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating settings...');

      try {
        const data: SettingsUpdate = {};

        if (opts.familyName) data.familyName = opts.familyName;
        if (opts.bottleUnit) data.defaultBottleUnit = opts.bottleUnit.toUpperCase();
        if (opts.solidsUnit) data.defaultSolidsUnit = opts.solidsUnit.toUpperCase();
        if (opts.heightUnit) data.defaultHeightUnit = opts.heightUnit.toUpperCase();
        if (opts.weightUnit) data.defaultWeightUnit = opts.weightUnit.toUpperCase();
        if (opts.tempUnit) data.defaultTempUnit = opts.tempUnit.toUpperCase();

        if (Object.keys(data).length === 0) {
          spin.stop();
          error('No settings specified to update');
          process.exit(1);
        }

        const s = await updateSettings(data);
        cacheSettingsLocally(s);
        spin.succeed('Settings updated');

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(s, {
          format: format as OutputFormat,
          fields: settingsFields,
        });
      } catch (err) {
        spin.fail('Failed to update settings');
        error(formatError(err));
        process.exit(1);
      }
    });

  settings
    .command('refresh')
    .description('Refresh cached settings from server')
    .action(async () => {
      const spin = spinner('Refreshing settings...');

      try {
        const s = await getSettings();
        cacheSettingsLocally(s);
        spin.succeed('Settings refreshed and cached locally');

        info(`Bottle unit: ${s.defaultBottleUnit}`);
        info(`Solids unit: ${s.defaultSolidsUnit}`);
        info(`Height unit: ${s.defaultHeightUnit}`);
        info(`Weight unit: ${s.defaultWeightUnit}`);
        info(`Temperature unit: ${s.defaultTempUnit}`);
      } catch (err) {
        spin.fail('Failed to refresh settings');
        error(formatError(err));
        process.exit(1);
      }
    });

  settings
    .command('cached')
    .description('Show locally cached settings')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action((opts: { output?: string }) => {
      const cached = getCachedSettings();

      if (!cached) {
        info('No cached settings. Run: sprout-track settings refresh');
        return;
      }

      const format = opts.output ? validateOutputFormat(opts.output) : undefined;

      output(cached, {
        format: format as OutputFormat,
        fields: [
          { key: 'defaultBottleUnit', label: 'Bottle Unit' },
          { key: 'defaultSolidsUnit', label: 'Solids Unit' },
          { key: 'defaultHeightUnit', label: 'Height Unit' },
          { key: 'defaultWeightUnit', label: 'Weight Unit' },
          { key: 'defaultTempUnit', label: 'Temperature Unit' },
          { key: 'cachedAt', label: 'Cached At', formatter: (v: unknown) => formatDate(v as string) },
        ],
      });
    });
}
