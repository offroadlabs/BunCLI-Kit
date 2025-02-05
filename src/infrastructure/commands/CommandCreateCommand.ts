import { CommandPort } from '../../domain/ports/CommandPort';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { PackageJsonSchema, CommandRegistryServiceSchema } from '../../domain/schemas/FileSchemas';
import { LoggerService } from '../../application/services/LoggerService';

export class CommandCreateCommand implements CommandPort {
  private readonly logger;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'CommandCreate',
      timestamp: false,
    });
  }

  getName(): string {
    return 'command:create';
  }

  getDescription(): string {
    return 'Generates a new command skeleton';
  }

  async execute(args: string[]): Promise<void> {
    if (args.length !== 1) {
      this.logger.error('Usage: bun run src/index.ts command:create <command-name>');
      return;
    }

    const commandName = args[0];
    const className = this.toPascalCase(commandName) + 'Command';
    const filePath = path.join('src', 'infrastructure', 'commands', `${className}.ts`);

    const template = `import { CommandPort } from "../../domain/ports/CommandPort";
import { LoggerService } from "../../application/services/LoggerService";

export class ${className} implements CommandPort {
    private readonly logger;

    constructor() {
        this.logger = LoggerService.getInstance().getLogger({
            prefix: '${commandName}',
            timestamp: false,
        });
    }

    getName(): string {
        return '${commandName}';
    }

    getDescription(): string {
        return 'Description of the ${commandName} command';
    }

    async execute(args: string[]): Promise<void> {
        // Implement your logic here
        this.logger.info('${commandName} command executed', args);
    }
}
`;

    try {
      fs.writeFileSync(filePath, template);
      this.logger.success(`Command ${className} successfully created in ${filePath}`);

      this.updateCommandRegistryService(className, commandName);
      this.updatePackageJson(commandName);
    } catch (error) {
      this.logger.error('Error while creating command:', error);
    }
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-:]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private updateCommandRegistryService(className: string, commandName: string): void {
    const registryPath = path.join('src', 'application', 'services', 'CommandRegistryService.ts');
    try {
      const content = fs.readFileSync(registryPath, 'utf-8');
      const validContent = CommandRegistryServiceSchema.parse(content);

      const importStatement = `import { ${className} } from '../../infrastructure/commands/${className}';\n`;
      let newContent = validContent;

      if (!validContent.includes(importStatement)) {
        const lastImportIndex = validContent.lastIndexOf('import');
        const endOfImports = validContent.indexOf('\n', lastImportIndex) + 1;
        newContent =
          validContent.slice(0, endOfImports) + importStatement + validContent.slice(endOfImports);
      }

      const commandInstantiation = `new ${className}(),\n`;
      const constructorIndex = newContent.indexOf('this.commandService = new CommandService([');

      if (constructorIndex !== -1) {
        const insertIndex = newContent.indexOf(']', constructorIndex);
        if (!newContent.includes(commandInstantiation) && insertIndex !== -1) {
          newContent =
            newContent.slice(0, insertIndex) +
            (newContent[insertIndex - 1] === '[' ? '' : '      ') +
            commandInstantiation +
            newContent.slice(insertIndex);
        }
      }

      fs.writeFileSync(registryPath, newContent);
      this.logger.success(`Command ${commandName} registered in CommandRegistryService.ts`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.error('Invalid CommandRegistryService.ts file format:', error.errors);
      } else {
        this.logger.error('Error while updating CommandRegistryService.ts:', error);
      }
    }
  }

  private updatePackageJson(commandName: string): void {
    const packageJsonPath = path.join('package.json');
    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const parsedJson = JSON.parse(packageJsonContent);

      const packageJson = PackageJsonSchema.parse(parsedJson);

      if (packageJson.scripts[commandName] === undefined) {
        packageJson.scripts[commandName] = `bun run src/index.ts ${commandName}`;

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        this.logger.success(`Script '${commandName}' added to package.json`);
      } else {
        this.logger.info(`Script '${commandName}' already exists in package.json`);
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
