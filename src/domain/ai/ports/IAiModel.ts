import { z } from 'zod';

export const AiResponseSchema = <T>(
  contentSchema: z.ZodType<T> = z.string() as unknown as z.ZodType<T>
): z.ZodObject<{
  content: z.ZodType<T | null>;
  model: z.ZodString;
}> =>
  z.object({
    content: contentSchema.nullable(),
    model: z.string(),
  });

export type AiResponse<T = string> = z.infer<ReturnType<typeof AiResponseSchema<T>>>;

export type FormatterOrSchema<T> =
  | { formatter: (content: string) => T | null; schema?: never }
  | { schema: z.ZodType<T>; formatter?: never }
  | { formatter?: never; schema?: never };

export interface IAiModel {
  name: string;
  generate<T = string>(
    prompt: string,
    options?: AiModelOptions & FormatterOrSchema<T>
  ): Promise<AiResponse<T>>;
  streamGenerate?<T = string>(
    prompt: string,
    options?: AiModelOptions & { formatter?: (content: string) => T | null }
  ): AsyncGenerator<AiResponse<T>>;
}

export interface AiModelOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
  systemPrompt?: string;
}
