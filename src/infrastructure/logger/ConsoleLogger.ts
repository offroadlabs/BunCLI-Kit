import { LoggerPort } from '@/domain/ports/LoggerPort';

enum ConsoleColor {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',
}

export class ConsoleLogger implements LoggerPort {
  private prefix: string = '';
  private useColor: boolean = true;
  private showTimestamp: boolean = false;

  constructor(options?: { prefix?: string; color?: boolean; timestamp?: boolean }) {
    this.prefix = options?.prefix ?? '';
    this.useColor = options?.color ?? true;
    this.showTimestamp = options?.timestamp ?? false;
  }

  private formatMessage(message: string, color: ConsoleColor): string {
    const parts: string[] = [];

    if (this.showTimestamp) {
      parts.push(`${ConsoleColor.Dim}[${new Date().toISOString()}]${ConsoleColor.Reset}`);
    }

    if (this.prefix) {
      parts.push(`${ConsoleColor.Dim}[${this.prefix}]${ConsoleColor.Reset}`);
    }

    if (this.useColor) {
      parts.push(`${color}${message}${ConsoleColor.Reset}`);
    } else {
      parts.push(message);
    }

    return parts.join(' ');
  }

  info(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage(message, ConsoleColor.FgWhite), ...args);
  }

  success(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage(message, ConsoleColor.FgGreen), ...args);
  }

  warning(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage(message, ConsoleColor.FgYellow), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage(message, ConsoleColor.FgRed), ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    console.debug(this.formatMessage(message, ConsoleColor.FgCyan), ...args);
  }

  withPrefix(prefix: string): LoggerPort {
    return new ConsoleLogger({
      prefix,
      color: this.useColor,
      timestamp: this.showTimestamp,
    });
  }

  withColor(color: boolean): LoggerPort {
    return new ConsoleLogger({
      prefix: this.prefix,
      color,
      timestamp: this.showTimestamp,
    });
  }

  withTimestamp(showTimestamp: boolean): LoggerPort {
    return new ConsoleLogger({
      prefix: this.prefix,
      color: this.useColor,
      timestamp: showTimestamp,
    });
  }
}
