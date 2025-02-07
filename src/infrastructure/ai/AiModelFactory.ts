import { IAiModel } from '../../domain/ai/ports/IAiModel';
import { OllamaModel } from './OllamaModel';
import { OpenAiModel } from './OpenAiModel';
import { AnthropicModel } from './AnthropicModel';
import { EnvConfigService } from '../config/EnvConfigService';

export class AiModelFactory {
  private static instance: AiModelFactory;
  private models: Map<string, IAiModel>;
  private readonly configService: EnvConfigService;

  private constructor() {
    this.models = new Map();
    this.configService = EnvConfigService.getInstance();
  }

  public static getInstance(): AiModelFactory {
    if (AiModelFactory.instance === undefined) {
      AiModelFactory.instance = new AiModelFactory();
    }
    return AiModelFactory.instance;
  }

  public createOllamaModel(modelName: string): IAiModel {
    const key = `ollama:${modelName}`;
    if (!this.models.has(key) || this.models.get(key) === undefined) {
      this.models.set(key, new OllamaModel(modelName, this.configService.getOllamaBaseUrl()));
    }
    const model = this.models.get(key);
    if (!model) throw new Error(`Model ${key} not found`);
    return model;
  }

  public createOpenAiModel(modelName: string): IAiModel {
    const key = `openai:${modelName}`;
    if (!this.models.has(key) || this.models.get(key) === undefined) {
      this.models.set(key, new OpenAiModel(modelName, this.configService.getOpenAiConfig()));
    }
    const model = this.models.get(key);
    if (!model) throw new Error(`Model ${key} not found`);
    return model;
  }

  public createAnthropicModel(modelName: string): IAiModel {
    const key = `anthropic:${modelName}`;
    if (!this.models.has(key) || this.models.get(key) === undefined) {
      this.models.set(key, new AnthropicModel(modelName, this.configService.getAnthropicApiKey()));
    }
    const model = this.models.get(key);
    if (!model) throw new Error(`Model ${key} not found`);
    return model;
  }

  public getModel(key: string): IAiModel | undefined {
    return this.models.get(key);
  }

  public getAllModels(): IAiModel[] {
    return Array.from(this.models.values());
  }
}
