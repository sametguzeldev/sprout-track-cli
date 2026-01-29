// Export types
export * from './types/index.js';

// Export config utilities
export {
  getConfig,
  getServer,
  setServer,
  getToken,
  setToken,
  clearToken,
  isTokenExpired,
  getFamilySlug,
  setFamilySlug,
  getDefaultBabyId,
  setDefaultBabyId,
  getOutputFormat,
  setOutputFormat,
  resetConfig,
  getConfigPath,
} from './config/store.js';

// Export API client
export {
  getClient,
  resetClient,
  requireAuth,
  apiRequest,
  get,
  post,
  put,
  patch,
  del,
} from './api/client.js';

// Export API endpoints
export * from './api/endpoints.js';

// Export output utilities
export {
  success,
  error,
  warning,
  info,
  spinner,
  output,
  formatJson,
  formatTable,
  formatKeyValue,
  formatPlain,
  formatPlainSingle,
  truncate,
} from './output/index.js';

// Export error classes
export {
  CliError,
  AuthError,
  ConfigError,
  ApiError,
  ValidationError,
  formatError,
} from './utils/errors.js';

// Export date utilities
export {
  now,
  parseDate,
  formatDate,
  formatRelative,
  formatDuration,
  formatDurationSeconds,
  startOfDay,
  endOfDay,
  isValidDate,
  toDateOnly,
} from './utils/date.js';

// Export validation utilities
export {
  requireString,
  optionalString,
  requireNumber,
  optionalNumber,
  parseBoolean,
  validateGender,
  validateSleepType,
  validateSleepQuality,
  validateFeedType,
  validateBreastSide,
  validateDiaperType,
  validateMilestoneCategory,
  validateMeasurementType,
  validateCalendarEventType,
  validateOutputFormat,
  validateUrl,
  validatePin,
  validateEmail,
  validateUuid,
} from './utils/validation.js';
