import Conf from 'conf';
import type { CliConfig, OutputFormat } from '../types/index.js';

const CONFIG_DEFAULTS: CliConfig = {
  server: '',
  outputFormat: 'table',
};

// Create the config store
const config = new Conf<CliConfig>({
  projectName: 'sprout-track',
  defaults: CONFIG_DEFAULTS,
});

export function getConfig(): CliConfig {
  return {
    server: config.get('server'),
    token: config.get('token'),
    tokenExpires: config.get('tokenExpires'),
    familySlug: config.get('familySlug'),
    defaultBabyId: config.get('defaultBabyId'),
    outputFormat: config.get('outputFormat'),
  };
}

export function getServer(): string {
  return config.get('server');
}

export function setServer(url: string): void {
  // Normalize URL - remove trailing slash
  const normalizedUrl = url.replace(/\/+$/, '');
  config.set('server', normalizedUrl);
}

export function getToken(): string | undefined {
  return config.get('token');
}

export function setToken(token: string, expiresAt?: string): void {
  config.set('token', token);
  if (expiresAt) {
    config.set('tokenExpires', expiresAt);
  }
}

export function clearToken(): void {
  config.delete('token');
  config.delete('tokenExpires');
}

export function isTokenExpired(): boolean {
  const expires = config.get('tokenExpires');
  if (!expires) return false;
  return new Date(expires) < new Date();
}

export function getFamilySlug(): string | undefined {
  return config.get('familySlug');
}

export function setFamilySlug(slug: string): void {
  config.set('familySlug', slug);
}

export function clearFamilySlug(): void {
  config.delete('familySlug');
}

export function getDefaultBabyId(): string | undefined {
  return config.get('defaultBabyId');
}

export function setDefaultBabyId(babyId: string): void {
  config.set('defaultBabyId', babyId);
}

export function clearDefaultBabyId(): void {
  config.delete('defaultBabyId');
}

export function getOutputFormat(): OutputFormat {
  return config.get('outputFormat');
}

export function setOutputFormat(format: OutputFormat): void {
  config.set('outputFormat', format);
}

export function resetConfig(): void {
  config.clear();
  // Re-apply defaults
  config.set('server', CONFIG_DEFAULTS.server);
  config.set('outputFormat', CONFIG_DEFAULTS.outputFormat);
}

export function getConfigPath(): string {
  return config.path;
}
