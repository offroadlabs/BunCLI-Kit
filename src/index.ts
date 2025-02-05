import { CommandService } from './application/services/CommandService';
import { HelpCommand } from './infrastructure/commands/HelpCommand';
import { CommandCreateCommand } from './infrastructure/commands/CommandCreateCommand';
import { CommandRemoveCommand } from './infrastructure/commands/CommandRemoveCommand';
import { LoggerService } from './application/services/LoggerService';

async function main(): Promise<number> {
  const commandService = new CommandService([
    new CommandCreateCommand(),
    new CommandRemoveCommand(),
  ]);

  const helpCommand = new HelpCommand(commandService.getCommands());
  commandService.addCommand(helpCommand);

  await commandService.execute(process.argv.slice(2));

  return 0;
}

const logger = LoggerService.getInstance().getLogger({
  prefix: 'System',
  timestamp: true,
});

main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
