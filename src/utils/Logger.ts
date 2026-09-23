type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Minimal structured logger. Kept dependency-free for now; swap the
 * `write` implementation for pino/winston later without touching call sites.
 */
export class Logger {
  constructor(private readonly context: string) {}

  public info(message: string, meta?: Record<string, unknown>): void {
    this.write('info', message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.write('error', message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      this.write('debug', message, meta);
    }
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta ? { meta } : {}),
    };
    const line = JSON.stringify(entry);

    if (level === 'error') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }
  }
}
