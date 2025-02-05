import { LoggerPort } from '@/domain/ports/LoggerPort';
import { ConsoleLogger } from '@/infrastructure/logger/ConsoleLogger';

export class LoggerService {
  private static instance: LoggerService | null = null;
  private defaultLogger: LoggerPort;

  private constructor() {
    this.defaultLogger = new ConsoleLogger();
  }

  public static getInstance(): LoggerService {
    if (LoggerService.instance === null) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public getLogger(options?: {
    prefix?: string;
    color?: boolean;
    timestamp?: boolean;
  }): LoggerPort {
    let logger = this.defaultLogger;

    if (options?.prefix !== undefined && options.prefix !== '') {
      logger = logger.withPrefix(options.prefix);
    }
    if (options?.color !== undefined) {
      logger = logger.withColor(options.color);
    }
    if (options?.timestamp !== undefined) {
      logger = logger.withTimestamp(options.timestamp);
    }

    return logger;
  }

  public setDefaultLogger(logger: LoggerPort): void {
    this.defaultLogger = logger;
  }
}
