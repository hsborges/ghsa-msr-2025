import z from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  GITHUB_API_URL: z.url().default('https://api.github.com'),
  GITHUB_TOKEN: z.string().optional(),
  CACHE_PATH: z.string().default('./.cache'),
  CACHE_STRATEGY: z.enum(['default', 'force-cache']).default('force-cache'),
});

export type Env = z.infer<typeof EnvSchema>;

export default EnvSchema.parse(process.env);
