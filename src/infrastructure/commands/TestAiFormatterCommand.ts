import { CommandPort } from '@/domain/ports/CommandPort';
import { LoggerService } from '@/application/services/LoggerService';
import { AiModelFactory } from '../ai/AiModelFactory';
import { z } from 'zod';
import { JsonFormatter } from '@/domain/ai/formatters/JsonFormatter';

const WeatherDataSchema = z.object({
  temperature: z.number(),
  conditions: z.string(),
  location: z.string(),
});

type WeatherData = z.infer<typeof WeatherDataSchema>;

export class TestAiFormatterCommand implements CommandPort {
  private readonly logger;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'test-ai-formatter',
      timestamp: false,
    });
  }

  getName(): string {
    return 'test-ai-formatter';
  }

  getDescription(): string {
    return 'Command to test the use of ollama with JSON formatter';
  }

  async execute(): Promise<void> {
    const factory = AiModelFactory.getInstance();
    const model = factory.createOllamaModel('mistral');
    const jsonFormatter = new JsonFormatter();

    try {
      const response = await model.generate<WeatherData>(
        'Give me the weather in Paris in JSON format with the fields temperature (number), conditions (string) and location (string) in this form: {"temperature": 20, "conditions": "sunny", "location": "Paris"}',
        {
          temperature: 0.7,
          systemPrompt: 'You are an assistant that only responds in valid JSON.',
          formatter: jsonFormatter.create(WeatherDataSchema),
        }
      );

      this.logger.info('Complete response:', response);
      this.logger.info('Model used:', response.model);
      this.logger.info('Weather data:');
      this.logger.info('- Temperature:', response.content?.temperature ?? 'N/A');
      this.logger.info('- Conditions:', response.content?.conditions ?? 'N/A');
      this.logger.info('- Location:', response.content?.location ?? 'N/A');

      // Example with streaming and simple transformation
      this.logger.info('\nStreaming response with transformation:');
      const upperCaseFormatter = (content: string): string => {
        return content.toUpperCase();
      };

      if (model.streamGenerate) {
        for await (const chunk of model.streamGenerate<string>('Tell me a short story.', {
          temperature: 0.7,
          formatter: upperCaseFormatter,
          systemPrompt: 'in french.',
        })) {
          // Response always contains metadata
          process.stdout.write(chunk.content ?? 'N/A');
          // We could also use metadata if needed
          // console.log('Model:', chunk.model);
        }
      }
    } catch (error) {
      this.logger.error('Error:', error);
    }
  }
}
