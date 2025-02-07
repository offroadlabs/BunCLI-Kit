import { IAiModel } from '@/domain/ai/ports/IAiModel';
import { AiModelFactory } from '@/infrastructure/ai/AiModelFactory';
import { LoggerService } from './LoggerService';
import { z } from 'zod';

export class AiModelService {
  private static instance: AiModelService;
  private readonly logger;
  private readonly factory: AiModelFactory;

  private constructor() {
    this.factory = AiModelFactory.getInstance();
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'ai-model-service',
      timestamp: true,
    });
  }

  public static getInstance(): AiModelService {
    if (AiModelService.instance === null) {
      AiModelService.instance = new AiModelService();
    }
    return AiModelService.instance;
  }

  public createModel(type: string, modelName: string, baseUrl?: string): IAiModel {
    this.logger.debug(`Creating AI model of type ${type} with name ${modelName}`);

    switch (type.toLowerCase()) {
      case 'ollama':
        return this.factory.createOllamaModel(modelName, baseUrl);
      default:
        throw new Error(`Unsupported AI model type: ${type}`);
    }
  }

  public getModel(key: string): IAiModel | undefined {
    return this.factory.getModel(key);
  }

  public getAllModels(): IAiModel[] {
    return this.factory.getAllModels();
  }

  public async validateModelResponse<T>(
    response: T | null,
    schema?: z.ZodType<T>
  ): Promise<boolean> {
    if (!schema) return true;
    if (response === null) return false;

    try {
      schema.parse(response);
      return true;
    } catch (error) {
      this.logger.error('Model response validation failed:', error);
      return false;
    }
  }
}
