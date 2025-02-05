import { CommandPort } from '../../domain/ports/CommandPort';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { PackageJsonSchema } from '../../domain/schemas/FileSchemas';
import { LoggerService } from '../../application/services/LoggerService';

export class CommandRemoveCommand implements CommandPort {
  private readonly logger;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'CommandRemove',
      timestamp: false,
    });
  }

  getName(): string {
    return 'command:remove';
  }

  getDescription(): string {
    return 'Removes an existing command';
  }

  async execute(args: string[]): Promise<void> {
    if (args.length !== 1) {
      this.logger.error('Usage: bun run src/index.ts command:remove <command-name>');
      return;
    }

    const commandName = args[0];
    const className = this.toPascalCase(commandName) + 'Command';
    const filePath = path.join('src', 'infrastructure', 'commands', `${className}.ts`);

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.error(`Command ${className} does not exist in ${filePath}`);
        return;
      }

      fs.unlinkSync(filePath);
      this.logger.success(`File ${filePath} successfully deleted`);

      this.removeFromIndexFile(className);
      this.removeFromPackageJson(commandName);
    } catch (error) {
      this.logger.error('Error while removing command:', error);
    }
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-:]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private removeFromIndexFile(className: string): void {
    const indexPath = path.join('src', 'index.ts');
    try {
      let content = fs.readFileSync(indexPath, 'utf-8');
      const lines = content.split('\n');

      const importIndex = lines.findIndex(
        line =>
          line.includes(`import`) &&
          line.includes(`{ ${className} }`) &&
          line.includes(`./infrastructure/commands/${className}`)
      );

      if (importIndex !== -1) {
        lines.splice(importIndex, 1);
      }

      const instanceIndex = lines.findIndex(line => line.includes(`new ${className}()`));

      if (instanceIndex !== -1) {
        lines.splice(instanceIndex, 1);

        if (
          lines[instanceIndex - 1]?.trim().endsWith(',') &&
          lines[instanceIndex]?.trim().startsWith(']')
        ) {
          lines[instanceIndex - 1] = lines[instanceIndex - 1].replace(/,\s*$/, '');
        }
      }

      content = lines.join('\n');
      fs.writeFileSync(indexPath, content);
      this.logger.success(`Command removed from index.ts`);
    } catch (error) {
      this.logger.error('Error while updating index.ts:', error);
    }
  }

  private removeFromPackageJson(commandName: string): void {
    const packageJsonPath = path.join('package.json');
    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const parsedJson = JSON.parse(packageJsonContent);

      const packageJson = PackageJsonSchema.parse(parsedJson);

      if (commandName in packageJson.scripts) {
        const { [commandName]: _, ...remainingScripts } = packageJson.scripts;
        packageJson.scripts = remainingScripts;

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        this.logger.success(`Script '${commandName}' removed from package.json`);
      } else {
        this.logger.info(`Script '${commandName}' did not exist in package.json`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.error('Invalid package.json format:', error.errors);
      } else {
        this.logger.error('Error while updating package.json:', error);
      }
    }
  }
}
