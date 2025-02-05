import { LoggerService } from './application/services/LoggerService';
import { CommandRegistryService } from './application/services/CommandRegistryService';
import { handleAutocomplete } from './cliCompleter';

// Check for autocompletion mode before proceeding.
handleAutocomplete();

async function main(): Promise<number> {
  const commandService = CommandRegistryService.getInstance().getCommandService();
  await commandService.execute(process.argv.slice(2));
  return 0;
}

const logger = LoggerService.getInstance().getLogger({
  prefix: 'System',
  timestamp: true,
});

main().catch(error => {
  logger.error('An error occurred:', error);
  process.exit(1);
});
