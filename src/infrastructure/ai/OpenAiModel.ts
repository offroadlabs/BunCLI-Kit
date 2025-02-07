import { z } from 'zod';
import { AiModelOptions, AiResponse } from '@/domain/ai/ports/IAiModel';
import OpenAI from 'openai';
import { BaseAiModel, RetryOptions } from './BaseAiModel';

export class OpenAiModel extends BaseAiModel {
  private readonly client: OpenAI;

  constructor(
    name: string,
    config: { apiKey: string; baseURL: string },
    retryOptions?: RetryOptions
  ) {
    super(name, retryOptions);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
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
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        if (
          finalOptions.systemPrompt !== null &&
          finalOptions.systemPrompt !== undefined &&
          finalOptions.systemPrompt.trim() !== ''
        ) {
          messages.push({
            role: 'system',
            content: finalOptions.systemPrompt,
          });
        }

        messages.push({
          role: 'user',
          content: prompt,
        });

        const completion = await this.client.chat.completions.create({
          model: this.name,
          messages,
          temperature: finalOptions.temperature,
          max_tokens: finalOptions.maxTokens,
          top_p: finalOptions.topP,
          stop: finalOptions.stop,
        });

        const content = finalOptions.formatter
          ? finalOptions.formatter(completion.choices[0]?.message?.content ?? '')
          : (completion.choices[0]?.message?.content as T);

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
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (
      options?.systemPrompt !== null &&
      options?.systemPrompt !== undefined &&
      options?.systemPrompt.trim() !== ''
    ) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const stream = await this.client.chat.completions.create({
      model: this.name,
      messages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      stop: options?.stop,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content !== undefined && content !== null) {
        yield {
          content: options?.formatter ? options.formatter(content) : (content as T),
          model: this.name,
        };
      }
    }
  }
}
