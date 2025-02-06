# BunCLI-Kit 🚀

[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](README.fr.md)

A powerful and modern TypeScript CLI development kit powered by Bun, designed to help you create robust command-line applications with ease. This toolkit provides a clean and structured way to create CLI commands using TypeScript, Zod for validation, and Bun for fast execution. It also includes a comprehensive system for interacting with AI models locally through Ollama, allowing you to enhance your CLI commands with artificial intelligence capabilities in a simple and efficient way.

## 🌟 Features

- **TypeScript First**: Built with TypeScript for maximum type safety and developer experience
- **Bun Powered**: Leverages Bun's speed and modern features
- **Clean Architecture**: Implements hexagonal architecture with domain-driven design principles
- **Data Validation**: Built-in Zod schema validation for robust command handling
- **Developer Experience**: Includes ESLint and Prettier configuration out of the box
- **Type Safety**: Strict TypeScript configuration for reliable code
- **Modern Patterns**: Implements SOLID principles and clean code practices
- **Advanced Logging**: Flexible logging system with multiple output options

## 📝 Logging System

The BunCLI-Kit includes a powerful logging system through the `LoggerService` that helps you track and debug your application:

- **Flexible Output**: Support for console and file logging
- **Log Levels**: Different log levels (INFO, ERROR, DEBUG, etc.)
- **Clean Interface**: Implementation of the `LoggerPort` interface for easy extension
- **Dependency Injection**: Follows clean architecture principles

Example usage:

```typescript
// Inject the logger service
constructor(private readonly logger: LoggerPort) {}

// Use in your code
this.logger.info('Command executed successfully');
this.logger.error('An error occurred', error);
this.logger.debug('Debug information');
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/offroadlabs/buncli-kit.git
cd buncli-kit

# Install dependencies
bun install

# See available commands
bun run help

# Create a new CLI command
bun run command:create <command-name>

# Remove a CLI command
bun run command:remove <command-name>
```

## 📖 Creating New Commands

1. Create a new command using the generator:

```bash
bun run command:create my-command
```

2. This will automatically:
   - Create a new command file in `src/infrastructure/commands/MyCommandCommand.ts`
   - Update `src/index.ts` to register the command
   - Add a script to `package.json`

The generated command will have this structure:

```typescript
import { CommandPort } from "../../domain/ports/CommandPort";

export class MyCommandCommand implements CommandPort {
    getName(): string {
        return 'my-command';
    }

    getDescription(): string {
        return 'Description de la commande my-command';
    }

    async execute(args: string[]): Promise<void> {
        // Implement your command logic here
        console.log('my-command command executed');
    }
}
```

## 🗑️ Removing Commands

To remove a command from your CLI:

```bash
bun run command:remove my-command
```

This will:

- Remove the command file
- Clean up the imports in `src/index.ts`
- Remove the script from `package.json`

## 🛠️ Development Guidelines

- Use Zod schemas for command argument validation
- Follow the hexagonal architecture pattern:
  - `domain/`: Core business logic and interfaces
  - `infrastructure/`: Command implementations
  - `application/`: Application services
- Write clean, maintainable code following SOLID principles
- Use the provided ESLint and Prettier configuration
- Add tests for your commands using Bun's test runner

## 🎨 Code Style & Linting

This project uses ESLint and Prettier to ensure consistent code style and catch potential issues early. The configuration is designed to enforce TypeScript best practices and maintain high code quality.

### ESLint Configuration

The project uses a modern flat configuration (`eslint.config.js`) with strict TypeScript rules:

```javascript
// Key ESLint rules:
{
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/strict-boolean-expressions': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  'eqeqeq': 'error',
  'no-var': 'error',
  'prefer-const': 'error'
}
```

### Prettier Configuration

Code formatting is handled by Prettier with the following settings:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Running Linting

```bash
# Run ESLint
bun run lint

# Fix auto-fixable issues
bun run lint --fix
```

## 🤖 Artificial Intelligence

BunCLI-Kit integrates a flexible system to interact with different AI models through a clean and extensible architecture.

### AI Architecture

- **IAiModel Interface**: Base interface for all AI models
- **Formatters**: Formatting system to parse AI responses
- **Factory Pattern**: AI model creation via `AiModelFactory` singleton
- **Streaming Support**: Built-in streaming capabilities for AI responses

### Using the JSON Formatter

The `JsonFormatter` allows parsing and validating JSON responses from AI models. Here's a complete example:

```typescript
import { CommandPort } from '@/domain/ports/CommandPort';
import { LoggerService } from '@/application/services/LoggerService';
import { AiModelFactory } from '../ai/AiModelFactory';
import { z } from 'zod';
import { JsonFormatter } from '@/domain/ai/formatters/JsonFormatter';

// Define your schema
const WeatherDataSchema = z.object({
  temperature: z.number(),
  conditions: z.string(),
  location: z.string(),
});

type WeatherData = z.infer<typeof WeatherDataSchema>;

export class MyAiCommand implements CommandPort {
  private readonly logger;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'my-ai-command',
      timestamp: false,
    });
  }

  async execute(): Promise<void> {
    const factory = AiModelFactory.getInstance();
    const model = factory.createOllamaModel('mistral');
    const jsonFormatter = new JsonFormatter();

    try {
      // Example with JSON formatting
      const response = await model.generate<WeatherData>(
        'Give me the weather in Paris in JSON format with the fields temperature (number), conditions (string) and location (string)',
        {
          temperature: 0.7,
          systemPrompt: 'You are an assistant that only responds in valid JSON.',
          formatter: jsonFormatter.create(WeatherDataSchema),
        }
      );

      this.logger.info('Weather data:');
      this.logger.info('- Temperature:', response.content?.temperature ?? 'N/A');
      this.logger.info('- Conditions:', response.content?.conditions ?? 'N/A');
      this.logger.info('- Location:', response.content?.location ?? 'N/A');

      // Example with streaming and simple transformation
      this.logger.info('\nStreaming response with transformation:');
      const upperCaseFormatter = (content: string): string => content.toUpperCase();

      if (model.streamGenerate) {
        for await (const chunk of model.streamGenerate<string>('Tell me a short story.', {
          temperature: 0.7,
          formatter: upperCaseFormatter,
          systemPrompt: 'in french.',
        })) {
          process.stdout.write(chunk.content ?? 'N/A');
        }
      }
    } catch (error) {
      this.logger.error('Error:', error);
    }
  }
}
```

### Key Features

- Factory singleton pattern for AI model instantiation
- Type-safe responses with Zod schema validation
- Support for streaming responses with transformation
- Built-in error handling and logging
- Flexible formatting system for different output types
- Temperature and system prompt configuration
- Support for multiple AI models (Ollama, etc.)

## 🔧 Professional Services

### Technical Expertise

I offer development and consulting services in the following areas:

- Modern Web Applications (Next.js, React, TypeScript)
- APIs and Microservices (Symfony, Node.js)
- Software Architecture and DevOps
- Technical Training and Support

### Areas of Intervention

- Custom Application Development
- Legacy System Migration and Modernization
- Performance Optimization
- Technical Consulting

### Technologies Mastered

- **Frontend**: TypeScript, React, Next.js, Tailwind
- **Backend**: PHP/Symfony, Node.js
- **Mobile**: Flutter, React Native
- **DevOps**: Docker, CI/CD, AWS
- **Databases**: PostgreSQL, MySQL, MongoDB

## 📫 Contact

For any collaboration or custom development requests:

- 📧 Email: [sebastien@offroadlabs.com](mailto:sebastien@offroadlabs.com)
- 📝 Blog: [https://timoner.com](https://timoner.com)
- 🌐 Website: [https://offroadlabs.com](https://offroadlabs.com)
- 📅 Calendar: [Schedule a meeting](https://hub.timoner.com)
- 📍 Location: Aix-en-Provence, France

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## ⭐ Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

Developed by [Sébastien TIMONER](https://github.com/offroadlabs)
