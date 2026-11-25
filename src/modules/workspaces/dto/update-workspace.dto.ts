import * as z from 'zod';
import { createWorkspaceSchema } from './create-workspace.dto.js';

export type UpdateWorkspaceDto = Partial<z.infer<typeof createWorkspaceSchema>>;
