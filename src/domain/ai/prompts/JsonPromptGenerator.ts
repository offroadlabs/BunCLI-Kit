import { z } from 'zod';
import { generateMock } from '@anatine/zod-mock';

export class JsonPromptGenerator {
  private getZodTypeDescription(zodType: z.ZodTypeAny): string {
    if (zodType instanceof z.ZodNumber) return 'number';
    if (zodType instanceof z.ZodString) return 'string';
    if (zodType instanceof z.ZodBoolean) return 'boolean';
    if (zodType instanceof z.ZodArray)
      return `array of ${this.getZodTypeDescription(zodType.element)}`;
    if (zodType instanceof z.ZodObject) return 'object';
    if (zodType instanceof z.ZodEnum) return `enum(${zodType._def.values.join('|')})`;
    if (zodType instanceof z.ZodDate) return 'date';
    return 'unknown';
  }

  private generateSchemaDescription<T extends z.ZodRawShape>(schema: z.ZodObject<T>): string {
    const shape = schema._def.shape();
    const example = generateMock(schema);

    const fieldsDescription = Object.entries(shape)
      .map(([key, value]) => `${key} (${this.getZodTypeDescription(value)})`)
      .join(', ');

    return `Give me the data in JSON format with the following fields: ${fieldsDescription} in this form: ${JSON.stringify(example)}`;
  }

  public generateSystemPrompt<T extends z.ZodRawShape>(schema: z.ZodObject<T>): string {
    const schemaDescription = this.generateSchemaDescription(schema);
    return `You are an assistant that only responds in valid JSON following this format: ${schemaDescription}`;
  }
}
