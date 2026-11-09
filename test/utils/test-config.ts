import { ConfigModuleOptions } from '@nestjs/config';
import { configSchema } from '../../src/config/config.schema.js';

export const testConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env.test.local', '.env.test'],
  validationSchema: configSchema,
};
