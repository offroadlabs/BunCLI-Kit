import { LoggerService } from '@/application/services/LoggerService';
import { z } from 'zod';

export class JsonFormatter {
  private readonly logger;

  constructor() {
    this.logger = LoggerService.getInstance().getLogger({
      prefix: 'JsonFormatter',
      timestamp: false,
    });
  }

  create<T>(schema: z.ZodType<T>) {
    return (content: string): T | null => {
      try {
        const firstValidChar = content.match(/[{[]/)?.[0];

        if (firstValidChar === undefined || firstValidChar === null) {
          const jsonData = JSON.parse(content.trim());
          return schema.parse(jsonData);
        }

        const correspondingChar = firstValidChar === '{' ? '}' : ']';
        const startIndex = content.indexOf(firstValidChar);
        const endIndex = content.lastIndexOf(correspondingChar);

        if (startIndex >= 0 && endIndex >= 0) {
          let cleanContent = content.substring(startIndex, endIndex + 1);
          cleanContent = cleanContent.replace(/\/\/.*$/gm, '');
          cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
          cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
          cleanContent = cleanContent.replace(/\s+/g, ' ').trim();

          const jsonData = JSON.parse(cleanContent);
          return schema.parse(jsonData);
        }

        const jsonData = JSON.parse(content.trim());
        return schema.parse(jsonData);
      } catch (error) {
        this.logger.error(`Failed to parse JSON response: ${error}`);
        this.logger.error(`Content: ${content}`);
        return null;
      }
    };
  }
}
