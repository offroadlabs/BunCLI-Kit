import { exit } from 'process';
import { CommandRegistryService } from './application/services/CommandRegistryService';

export function handleAutocomplete(): void {
  if (process.argv.includes('--completion')) {
    const availableCommands = CommandRegistryService.getInstance().getAvailableCommands();
    console.log(availableCommands.join('\n'));
    exit(0);
  }
}
