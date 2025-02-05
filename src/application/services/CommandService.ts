import { CommandPort } from '../../domain/ports/CommandPort';
import { LoggerService } from './LoggerService';

export class CommandService {
  private commands: Map<string, CommandPort>;
  private readonly logger;

  constructor(commands: CommandPort[]) {
    this.commands = new Map();
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'CommandService',
      timestamp: false,
    });

    commands.forEach(command => {
      this.commands.set(command.getName(), command);
    });
  }

  getCommands(): Map<string, CommandPort> {
    return this.commands;
  }

  addCommand(command: CommandPort): void {
    this.commands.set(command.getName(), command);
  }

  async execute(args: string[]): Promise<void> {
    const commandName = args[0] || 'help';
    const command = this.commands.get(commandName);

    if (!command) {
      const helpCommand = this.commands.get('help');
      if (helpCommand) {
        await helpCommand.execute(args.slice(1));
      } else {
        this.logger.error('Command not found and help command not available');
      }
      return;
    }

    await command.execute(args.slice(1));
  }
}
