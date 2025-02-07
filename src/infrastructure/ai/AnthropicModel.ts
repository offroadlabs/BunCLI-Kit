import { z } from 'zod';
import { AiModelOptions, AiResponse } from '@/domain/ai/ports/IAiModel';
import Anthropic from '@anthropic-ai/sdk';
import { BaseAiModel, RetryOptions } from './BaseAiModel';

type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export class AnthropicModel extends BaseAiModel {
  private readonly client: Anthropic;

  constructor(name: string, apiKey: string, retryOptions?: RetryOptions) {
    super(name, retryOptions);

    this.client = new Anthropic({ apiKey });
  }

  async generate<T = string>(
    prompt: string,
    options?: AiModelOptions & {
      formatter?: (content: string) => T | null;
      schema?: z.ZodType<T>;
      retry?: RetryOptions;
    }
  ): Promise<AiResponse<T>> {
    const finalOptions = this.prepareOptions(options);

    return this.retryOperation(
      async () => {
        const messages: AnthropicMessage[] = [];

        if (
          finalOptions.systemPrompt !== null &&
          finalOptions.systemPrompt !== undefined &&
          finalOptions.systemPrompt.trim() !== ''
        ) {
          messages.push({ role: 'user', content: finalOptions.systemPrompt });
        }

        messages.push({ role: 'user', content: prompt });

        let completion;
        try {
          completion = await this.client.messages.create({
            model: this.name,
            messages,
            temperature: finalOptions.temperature ?? 0.7,
            max_tokens: finalOptions.maxTokens ?? 1000,
            top_p: finalOptions.topP ?? 1,
            stop_sequences: finalOptions.stop,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to generate response: ${errorMessage}`);
        }

        if (!completion?.content?.length) {
          throw new Error('No content received from the model');
        }

        const textBlock = completion.content.find(
          (block): block is { type: 'text'; text: string; citations: never[] } =>
            block.type === 'text' && typeof block.text === 'string'
        );

        if (!textBlock) {
          throw new Error('No text content found in the response');
        }

        const content = finalOptions.formatter
          ? finalOptions.formatter(textBlock.text)
          : (textBlock.text as T);

        return {
          content,
          model: this.name,
        };
      },
      result => this.validateResult(result, finalOptions.schema),
      options?.retry || this.retryOptions
    );
  }

  async *streamGenerate<T = string>(
    prompt: string,
    options?: AiModelOptions & { formatter?: (content: string) => T | null }
  ): AsyncGenerator<AiResponse<T>> {
    const messages: AnthropicMessage[] = [];

    if (
      options?.systemPrompt !== null &&
      options?.systemPrompt !== undefined &&
      options?.systemPrompt.trim() !== ''
    ) {
      messages.push({ role: 'user', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    try {
      const stream = await this.client.messages.create({
        model: this.name,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        top_p: options?.topP ?? 1,
        stop_sequences: options?.stop,
        stream: true,
      });

      for await (const chunk of stream) {
        if ('content' in chunk && Array.isArray(chunk.content) && chunk.content.length > 0) {
          const textBlock = chunk.content.find(
            (block): block is { type: 'text'; text: string; citations: never[] } =>
              block.type === 'text' && typeof block.text === 'string'
          );

          if (textBlock) {
            yield {
              content: options?.formatter
                ? options.formatter(textBlock.text)
                : (textBlock.text as T),
              model: this.name,
            };
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to stream response: ${errorMessage}`);
    }
  }
}
