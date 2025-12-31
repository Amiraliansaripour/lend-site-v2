// * types
type LogLevel = keyof typeof LEVELS;

type LogFn = (...inputs: any[]) => void;

type BaseLogger = Record<LogLevel, LogFn>;

type Logger = BaseLogger & { always: BaseLogger };

// * constants
const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

const shouldLog = (level: LogLevel) => {
  return LEVELS[level] >= LEVELS[logLevel];
};

const logLevel: LogLevel = 'debug'; // TODO: make log level dynamic

const loggerFactory = (shouldLog: (level: LogLevel) => boolean): BaseLogger => {
  return {
    debug: (...args: any[]) => shouldLog('debug') && console.debug('[DEBUG]', ...args),
    info: (...args: any[]) => shouldLog('info') && console.info('[INFO]', ...args),
    warn: (...args: any[]) => shouldLog('warn') && console.warn('[WARN]', ...args),
    error: (...args: any[]) => shouldLog('error') && console.error('[ERROR]', ...args),
  };
};

export const log: Logger = {
  ...loggerFactory(shouldLog),
  always: loggerFactory(() => true),
};
