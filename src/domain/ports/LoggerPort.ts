export interface LoggerPort {
  info(message: string, ...args: unknown[]): void;
  success(message: string, ...args: unknown[]): void;
  warning(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  
  // Options de formatage
  withPrefix(prefix: string): LoggerPort;
  withColor(color: boolean): LoggerPort;
  withTimestamp(showTimestamp: boolean): LoggerPort;
} 