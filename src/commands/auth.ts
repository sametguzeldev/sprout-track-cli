import { Command } from 'commander';
import {
  getToken,
  setToken,
  clearToken,
  getFamilySlug,
  setFamilySlug,
  clearFamilySlug,
  isTokenExpired,
  getServer,
} from '../config/store.js';
import { authWithPin, authWithAccount, refreshToken } from '../api/endpoints.js';
import { success, error, info, spinner, output } from '../output/index.js';
import { validatePin, validateEmail, validateOutputFormat } from '../utils/validation.js';
import { formatError, ConfigError } from '../utils/errors.js';
import type { OutputFormat } from '../types/index.js';

export function registerAuthCommands(program: Command): void {
  const auth = program
    .command('auth')
    .description('Authentication commands');

  auth
    .command('login')
    .description('Authenticate with Sprout-Track server')
    .option('-p, --pin <pin>', 'Security PIN')
    .option('-l, --login-id <id>', 'Login ID (for caretaker auth)')
    .option('-f, --family <slug>', 'Family slug')
    .option('-e, --email <email>', 'Email address (for account auth)')
    .option('--password <password>', 'Password (for account auth)')
    .action(async (opts: {
      pin?: string;
      loginId?: string;
      family?: string;
      email?: string;
      password?: string;
    }) => {
      const spin = spinner('Authenticating...');

      try {
        const server = getServer();
        if (!server) {
          throw new ConfigError();
        }

        let token: string;
        let familySlug: string | undefined;

        // Account-based authentication
        if (opts.email) {
          const email = validateEmail(opts.email);

          let password = opts.password;
          if (!password) {
            const inquirer = await import('inquirer');
            const { pwd } = await inquirer.default.prompt([
              {
                type: 'password',
                name: 'pwd',
                message: 'Password:',
                mask: '*',
              },
            ]);
            password = pwd;
          }

          const result = await authWithAccount({ email, password: password! });

          if (!result.success || !result.token) {
            throw new Error(result.message || 'Authentication failed');
          }

          token = result.token;
          familySlug = result.user?.familySlug;

          spin.succeed(`Authenticated as ${result.user?.firstName || email}`);
        }
        // PIN-based authentication
        else {
          let pin = opts.pin;

          if (!pin) {
            const inquirer = await import('inquirer');
            const { inputPin } = await inquirer.default.prompt([
              {
                type: 'password',
                name: 'inputPin',
                message: 'Security PIN:',
                mask: '*',
              },
            ]);
            pin = inputPin;
          }

          validatePin(pin!);

          const result = await authWithPin({
            securityPin: pin!,
            loginId: opts.loginId,
            familySlug: opts.family,
          });

          token = result.token;
          familySlug = result.familySlug || opts.family;

          spin.succeed(`Authenticated as ${result.name}`);
        }

        // Calculate token expiration (default 30 minutes from now)
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        setToken(token, expiresAt);

        if (familySlug) {
          setFamilySlug(familySlug);
          info(`Family: ${familySlug}`);
        }
      } catch (err) {
        spin.fail('Authentication failed');
        error(formatError(err));
        process.exit(1);
      }
    });

  auth
    .command('logout')
    .description('Clear authentication credentials')
    .action(() => {
      clearToken();
      clearFamilySlug();
      success('Logged out successfully');
    });

  auth
    .command('status')
    .description('Show authentication status')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action((opts: { output?: string }) => {
      try {
        const token = getToken();
        const familySlug = getFamilySlug();
        const server = getServer();
        const expired = isTokenExpired();

        const status = {
          authenticated: !!token && !expired,
          server: server || 'Not configured',
          familySlug: familySlug || 'Not set',
          tokenStatus: !token ? 'No token' : expired ? 'Expired' : 'Valid',
        };

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(status, {
          format: format as OutputFormat,
          fields: [
            { key: 'authenticated', label: 'Authenticated' },
            { key: 'server', label: 'Server' },
            { key: 'familySlug', label: 'Family' },
            { key: 'tokenStatus', label: 'Token Status' },
          ],
        });
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });

  auth
    .command('whoami')
    .description('Show current user information')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: { output?: string }) => {
      try {
        const token = getToken();
        if (!token) {
          error('Not authenticated. Run: sprout-track auth login');
          process.exit(1);
        }

        // Decode JWT to get user info (without verification)
        const parts = token.split('.');
        if (parts.length !== 3) {
          error('Invalid token format');
          process.exit(1);
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        const userInfo = {
          id: payload.id,
          name: payload.name,
          role: payload.role,
          type: payload.type,
          familyId: payload.familyId,
          familySlug: payload.familySlug,
          isAccountAuth: payload.isAccountAuth || false,
        };

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(userInfo, {
          format: format as OutputFormat,
          fields: [
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role' },
            { key: 'type', label: 'Type' },
            { key: 'familySlug', label: 'Family' },
            { key: 'isAccountAuth', label: 'Account Auth' },
          ],
        });
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });

  auth
    .command('refresh')
    .description('Refresh authentication token')
    .action(async () => {
      const spin = spinner('Refreshing token...');

      try {
        const result = await refreshToken();

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        setToken(result.token, expiresAt);

        spin.succeed('Token refreshed');
      } catch (err) {
        spin.fail('Token refresh failed');
        error(formatError(err));
        process.exit(1);
      }
    });
}
