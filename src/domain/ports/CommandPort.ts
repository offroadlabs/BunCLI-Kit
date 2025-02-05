export interface CommandPort {
  execute(args: string[]): Promise<void>;
  getName(): string;
  getDescription(): string;
}
