import { z } from 'zod';

export const PackageJsonSchema = z
  .object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
    main: z.string().optional(),
    type: z.string().optional(),
    scripts: z.record(z.string()),
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()).optional(),
    author: z.string().optional(),
    license: z.string().optional(),
    // Other common optional fields
    repository: z
      .object({
        type: z.string(),
        url: z.string(),
      })
      .optional(),
    keywords: z.array(z.string()).optional(),
    bugs: z
      .object({
        url: z.string(),
      })
      .optional(),
    homepage: z.string().optional(),
  })
  .strict();

export const IndexContentSchema = z.string().min(1);

export const CommandRegistryServiceSchema = z
  .string()
  .regex(/export class CommandRegistryService/)
  .and(z.string().min(1));

export const CommandRegistryImportSchema = z
  .string()
  .regex(/import.*CommandRegistryService/)
  .and(z.string().min(1));
