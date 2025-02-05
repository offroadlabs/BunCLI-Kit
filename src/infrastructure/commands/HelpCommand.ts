import { CommandPort } from '@/domain/ports/CommandPort';
import { LoggerService } from '@/application/services/LoggerService';

export class HelpCommand implements CommandPort {
  private readonly logger;

  constructor(private readonly commands: Map<string, CommandPort>) {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'Help',
      timestamp: false,
    });
  }

  getName(): string {
    return 'help';
  }

  getDescription(): string {
    return 'Displays this help message';
  }

  async execute(): Promise<void> {
    this.logger.info('\nUsage: bun run <command>\n');
    this.logger.info('Available commands:');

    for (const command of this.commands.values()) {
      this.logger.info(`  ${command.getName().padEnd(10)} ${command.getDescription()}`);
    }

    this.logger.info('');
  }
}
