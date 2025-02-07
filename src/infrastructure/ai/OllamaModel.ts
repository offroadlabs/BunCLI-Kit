import { z } from 'zod';
import { AiModelOptions, AiResponse, IAiModel } from '@/domain/ai/ports/IAiModel';
import { JsonPromptGenerator } from '@/domain/ai/prompts/JsonPromptGenerator';
import { JsonFormatter } from '@/domain/ai/formatters/JsonFormatter';

interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
}

export class OllamaModel implements IAiModel {
  private readonly defaultRetryOptions: RetryOptions = {
    maxAttempts: 3,
    delayMs: 1000,
  };

  constructor(
    public readonly name: string,
    private readonly baseUrl: string = 'http://localhost:11434',
    private readonly retryOptions: RetryOptions = { maxAttempts: 3, delayMs: 60000 }
  ) {}

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryOperation<T>(
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

  async generate<T = string>(
    prompt: string,
    options?: AiModelOptions & {
      formatter?: (content: string) => T | null;
      schema?: z.ZodType<T>;
      retry?: RetryOptions;
    }
  ): Promise<AiResponse<T>> {
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

    return this.retryOperation(
      async () => {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.name,
            prompt,
            stream: false,
            system: finalOptions.systemPrompt,
            temperature: finalOptions.temperature,
            top_p: finalOptions.topP,
            stop: finalOptions.stop,
            num_predict: finalOptions.maxTokens,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const content = finalOptions.formatter
          ? finalOptions.formatter(data.response)
          : data.response;

        return {
          content,
          model: this.name,
        };
      },
      result => {
        if (finalOptions.schema) {
          try {
            finalOptions.schema.parse(result.content);
            return true;
          } catch {
            return false;
          }
        }
        return result.content !== null;
      },
      options?.retry || this.retryOptions
    );
  }

  async *streamGenerate<T = string>(
    prompt: string,
    options?: AiModelOptions & { formatter?: (content: string) => T | null }
  ): AsyncGenerator<AiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.name,
        prompt,
        stream: true,
        system: options?.systemPrompt,
        temperature: options?.temperature,
        top_p: options?.topP,
        stop: options?.stop,
        num_predict: options?.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama stream request failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last potentially incomplete line in the buffer
        const lastLine = lines.pop();
        buffer = lastLine === undefined ? '' : lastLine;

        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            const data = JSON.parse(line);
            const content = options?.formatter ? options.formatter(data.response) : data.response;

            if (content !== null && content !== undefined) {
              yield {
                content,
                model: this.name,
              };
            }
          } catch (error) {
            console.error('Error parsing JSON line:', error, 'Line:', line);
            // Continue to next line instead of breaking the stream
            continue;
          }
        }
      }

      // Process any remaining data in the buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          const content = options?.formatter ? options.formatter(data.response) : data.response;

          if (content !== null && content !== undefined) {
            yield {
              content,
              model: this.name,
            };
          }
        } catch (error) {
          console.error('Error parsing final JSON buffer:', error);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
