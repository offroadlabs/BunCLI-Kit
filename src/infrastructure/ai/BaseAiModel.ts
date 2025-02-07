import { z } from 'zod';
import { AiModelOptions, AiResponse, IAiModel } from '@/domain/ai/ports/IAiModel';
import { JsonPromptGenerator } from '@/domain/ai/prompts/JsonPromptGenerator';
import { JsonFormatter } from '@/domain/ai/formatters/JsonFormatter';

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
}

export abstract class BaseAiModel implements IAiModel {
  protected readonly defaultRetryOptions: RetryOptions = {
    maxAttempts: 3,
    delayMs: 1000,
  };

  constructor(
    public readonly name: string,
    protected readonly retryOptions: RetryOptions = { maxAttempts: 3, delayMs: 60000 }
  ) {}

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    validator: (result: T) => boolean,
    options: RetryOptions = this.defaultRetryOptions
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        const result = await operation();
        if (validator(result)) {
          return result;
        }
        lastError = new Error(`Invalid response format on attempt ${attempt}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (attempt < options.maxAttempts) {
        await this.delay(options.delayMs);
      }
    }

    throw new Error(
      `Operation failed after ${options.maxAttempts} attempts. Last error: ${lastError?.message}`
    );
  }

  protected prepareOptions<T>(
    options?: AiModelOptions & {
      formatter?: (content: string) => T | null;
      schema?: z.ZodType<T>;
      retry?: RetryOptions;
    }
  ): AiModelOptions & {
    formatter?: (content: string) => T | null;
    schema?: z.ZodType<T>;
    retry?: RetryOptions;
  } {
    const finalOptions = options ? { ...options } : {};
    if (finalOptions.schema && finalOptions.schema instanceof z.ZodObject) {
      const jsonPromptGenerator = new JsonPromptGenerator();
      const jsonFormatter = new JsonFormatter();

      const generatedSystemPrompt = jsonPromptGenerator.generateSystemPrompt(finalOptions.schema);
      if (
        finalOptions?.systemPrompt !== null &&
        finalOptions?.systemPrompt !== undefined &&
        finalOptions.systemPrompt.trim() !== ''
      ) {
        finalOptions.systemPrompt = `${generatedSystemPrompt}\n${finalOptions.systemPrompt}`;
      } else {
        finalOptions.systemPrompt = generatedSystemPrompt;
      }
      finalOptions.formatter = jsonFormatter.create(finalOptions.schema);
    }
    return finalOptions;
  }

  protected validateResult<T>(result: AiResponse<T>, schema?: z.ZodType<T>): boolean {
    if (schema) {
      try {
        schema.parse(result.content);
        return true;
      } catch {
        return false;
      }
    }
    return result.content !== null;
  }

  abstract generate<T = string>(
    prompt: string,
    options?: AiModelOptions & {
      formatter?: (content: string) => T | null;
      schema?: z.ZodType<T>;
      retry?: RetryOptions;
    }
  ): Promise<AiResponse<T>>;

  abstract streamGenerate<T = string>(
    prompt: string,
    options?: AiModelOptions & { formatter?: (content: string) => T | null }
  ): AsyncGenerator<AiResponse<T>>;
}
