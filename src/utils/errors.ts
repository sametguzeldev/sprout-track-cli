export class CliError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'CliError';
  }
}

export class AuthError extends CliError {
  constructor(message: string = 'Authentication required. Please run: sprout-track auth login') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class ConfigError extends CliError {
  constructor(message: string = 'Server not configured. Please run: sprout-track config set-server <url>') {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

export class ApiError extends CliError {
  constructor(message: string, statusCode?: number) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'ApiError';
  }
}

export class ValidationError extends CliError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export function formatError(error: unknown): string {
  if (error instanceof CliError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function isAxiosError(error: unknown): error is {
  response?: { status: number; data?: { error?: string; message?: string } };
  message: string;
  code?: string;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    ('response' in error || 'code' in error)
  );
}
