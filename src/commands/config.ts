import { Command } from 'commander';
import {
  getConfig,
  setServer,
  setOutputFormat,
  resetConfig,
  getConfigPath,
} from '../config/store.js';
import { resetClient } from '../api/client.js';
import { success, error, output } from '../output/index.js';
import { validateUrl, validateOutputFormat } from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat } from '../types/index.js';

export function registerConfigCommands(program: Command): void {
  const config = program
    .command('config')
    .description('Manage CLI configuration');

  config
    .command('set-server <url>')
    .description('Set the Sprout-Track server URL')
    .action((url: string) => {
      try {
        const validUrl = validateUrl(url);
        setServer(validUrl);
        resetClient(); // Reset the API client to use new server
        success(`Server set to: ${validUrl}`);
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });

  config
    .command('set-output <format>')
    .description('Set default output format (json, table, plain)')
    .action((format: string) => {
      try {
        const validFormat = validateOutputFormat(format);
        setOutputFormat(validFormat);
        success(`Default output format set to: ${validFormat}`);
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });

  config
    .command('show')
    .description('Show current configuration')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action((opts: { output?: string }) => {
      try {
        const configData = getConfig();
        const displayConfig = {
          ...configData,
          token: configData.token ? `${configData.token.substring(0, 20)}...` : undefined,
          configPath: getConfigPath(),
        };

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(displayConfig, {
          format: format as OutputFormat,
          fields: [
            { key: 'server', label: 'Server' },
            { key: 'familySlug', label: 'Family Slug' },
            { key: 'defaultBabyId', label: 'Default Baby ID' },
            { key: 'outputFormat', label: 'Output Format' },
            { key: 'token', label: 'Token' },
            { key: 'tokenExpires', label: 'Token Expires' },
            { key: 'configPath', label: 'Config Path' },
          ],
        });
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });

  config
    .command('reset')
    .description('Reset configuration to defaults')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'This will clear all configuration including authentication. Continue?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        resetConfig();
        resetClient();
        success('Configuration reset to defaults');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });

  config
    .command('path')
    .description('Show configuration file path')
    .action(() => {
      console.log(getConfigPath());
    });
}
