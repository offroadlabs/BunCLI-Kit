import { IAiModel } from '../../domain/ai/ports/IAiModel';
import { OllamaModel } from './OllamaModel';

export class AiModelFactory {
  private static instance: AiModelFactory;
  private models: Map<string, IAiModel>;

  private constructor() {
    this.models = new Map();
  }

  public static getInstance(): AiModelFactory {
    if (AiModelFactory.instance === undefined) {
      AiModelFactory.instance = new AiModelFactory();
    }
    return AiModelFactory.instance;
  }

  public createOllamaModel(modelName: string, baseUrl?: string): IAiModel {
    const key = `ollama:${modelName}`;
    if (!this.models.has(key) || this.models.get(key) === undefined) {
      this.models.set(key, new OllamaModel(modelName, baseUrl));
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
