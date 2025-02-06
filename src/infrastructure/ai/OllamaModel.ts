import { AiModelOptions, AiResponse, IAiModel } from '../../domain/ai/ports/IAiModel';

export class OllamaModel implements IAiModel {
  constructor(
    public readonly name: string,
    private readonly baseUrl: string = 'http://localhost:11434'
  ) {}

  async generate<T = string>(
    prompt: string,
    options?: AiModelOptions & { formatter?: (content: string) => T | null }
  ): Promise<AiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.name,
        prompt,
        stream: false,
        system: options?.systemPrompt,
        temperature: options?.temperature,
        top_p: options?.topP,
        stop: options?.stop,
        num_predict: options?.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: options?.formatter ? options.formatter(data.response) : (data.response as T),
      model: this.name,
    };
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

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          const data = JSON.parse(line);
          yield {
            content: options?.formatter ? options.formatter(data.response) : (data.response as T),
            model: this.name,
          };
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
