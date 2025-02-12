import { CommandPort } from '@/domain/ports/CommandPort';
import { LoggerService } from '@/application/services/LoggerService';
import { AiModelService } from '@/application/services/AiModelService';
import { z } from 'zod';

const WeatherDataSchema = z.object({
  temperature: z.number(),
  conditions: z.string(),
  location: z.string(),
});

const MultipleCitiesWeatherSchema = z.object({
  cities: z.array(
    z.object({
      city: z.string(),
      temperature: z.number(),
      conditions: z.string(),
    })
  ),
});

export class TestAiFormatterCommand implements CommandPort {
  private readonly logger;
  private readonly aiModelService;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'test-ai-formatter',
      timestamp: false,
    });
    this.aiModelService = AiModelService.getInstance();
  }

  getName(): string {
    return 'test-ai-formatter';
  }

  getDescription(): string {
    return 'Command to test the use of ollama with JSON formatter';
  }

  async execute(): Promise<void> {
    const model = this.aiModelService.createModel('ollama', 'mistral');
    //const model = this.aiModelService.createModel('anthropic', 'claude-3-5-sonnet-20241022');
    //const model = this.aiModelService.createModel('openai', 'gpt-4o-mini');

    try {
      // Test simple weather data
      const response = await model.generate(
        `Give me the weather in Paris. For temperature, write 9 for 9°C, 10 for 10°C, etc.`,
        {
          temperature: 0.7,
          systemPrompt: `You are a weather reporter. Write in Spanish.`,
          schema: WeatherDataSchema,
        }
      );

      this.logger.info('Single city response:', response);
      this.logger.info('Model used:', response.model);
      this.logger.info('Weather data:');
      this.logger.info('- Temperature:', response.content?.temperature ?? 'N/A');
      this.logger.info('- Conditions:', response.content?.conditions ?? 'N/A');
      this.logger.info('- Location:', response.content?.location ?? 'N/A');

      // Validate response
      const isValid = await this.aiModelService.validateModelResponse(
        response.content,
        WeatherDataSchema
      );
      this.logger.info('Response validation:', isValid ? 'passed' : 'failed');

      // Test multiple cities weather data
      this.logger.info('\nTesting multiple cities weather:');
      const multiCityResponse = await model.generate(
        `Give me the current weather for Paris, Lyon, and Marseille. For temperature, write 9 for 9°C, 10 for 10°C, etc.`,
        {
          temperature: 0.7,
          schema: MultipleCitiesWeatherSchema,
        }
      );

      this.logger.info('Multiple cities response:');
      multiCityResponse.content?.cities.forEach(city => {
        this.logger.info(`${city.city}:`);
        this.logger.info('- Temperature:', city.temperature);
        this.logger.info('- Conditions:', city.conditions);
      });

      this.logger.info('\nTesting simple text generation for weather:');
      const textResponse = await model.generate(
        'Describe the current weather in Nice, France in a poetic way.',
        {
          temperature: 0.7,
          systemPrompt: 'You are a poetic weather reporter. Write in French.',
        }
      );

      this.logger.info('Poetic weather description:');
      this.logger.info(textResponse.content ?? 'N/A');

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
          process.stdout.write(chunk.content ?? 'N/A');
        }
      }
    } catch (error) {
      this.logger.error('Error:', error);
    }
  }
}
