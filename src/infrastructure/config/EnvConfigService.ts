import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional().default('https://api.openai.com/v1'),
  ANTHROPIC_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().optional().default('http://localhost:11434'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export class EnvConfigService {
  private static instance: EnvConfigService;
  private config: EnvConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): EnvConfigService {
    if (EnvConfigService.instance === null || EnvConfigService.instance === undefined) {
      EnvConfigService.instance = new EnvConfigService();
    }
    return EnvConfigService.instance;
  }

  private loadConfig(): EnvConfig {
    const env = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    };

    const result = envSchema.safeParse(env);

    if (!result.success) {
      throw new Error(`Invalid configuration: ${result.error.message}`);
    }

    return result.data;
  }

  public getOpenAiConfig(): { apiKey: string; baseURL: string } {
    if (
      this.config.OPENAI_API_KEY === null ||
      this.config.OPENAI_API_KEY === undefined ||
      this.config.OPENAI_API_KEY.trim() === ''
    ) {
      throw new Error(
        'The OpenAI API key is required. Set the OPENAI_API_KEY environment variable.'
      );
    }
    return {
      apiKey: this.config.OPENAI_API_KEY,
      baseURL: this.config.OPENAI_BASE_URL,
    };
  }

  public getAnthropicApiKey(): string {
    if (
      this.config.ANTHROPIC_API_KEY === null ||
      this.config.ANTHROPIC_API_KEY === undefined ||
      this.config.ANTHROPIC_API_KEY.trim() === ''
    ) {
      throw new Error(
        'The Anthropic API key is required. Set the ANTHROPIC_API_KEY environment variable.'
      );
    }
    return this.config.ANTHROPIC_API_KEY;
  }

  public getOllamaBaseUrl(): string {
    return this.config.OLLAMA_BASE_URL;
  }
}
