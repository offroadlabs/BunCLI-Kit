import { CommandService } from './CommandService';
import { CommandCreateCommand } from '../../infrastructure/commands/CommandCreateCommand';
import { CommandRemoveCommand } from '../../infrastructure/commands/CommandRemoveCommand';
import { HelpCommand } from '../../infrastructure/commands/HelpCommand';

export class CommandRegistryService {
  private static instance: CommandRegistryService | null = null;
  private commandService: CommandService;

  private constructor() {
    this.commandService = new CommandService([
      new CommandCreateCommand(),
      new CommandRemoveCommand(),
]);

    const helpCommand = new HelpCommand(this.commandService.getCommands());
    this.commandService.addCommand(helpCommand);
  }

  public static getInstance(): CommandRegistryService {
    if (!CommandRegistryService.instance) {
      CommandRegistryService.instance = new CommandRegistryService();
    }
    return CommandRegistryService.instance;
  }

  public getCommandService(): CommandService {
    return this.commandService;
  }

  public getAvailableCommands(): string[] {
    return Array.from(this.commandService.getCommands().keys());
  }
}
