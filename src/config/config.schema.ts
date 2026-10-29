import z from 'zod';

const logLevel = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];

export const configSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z.enum(logLevel).default('info'),
  PORT: z.coerce.number().default(3000),
});
