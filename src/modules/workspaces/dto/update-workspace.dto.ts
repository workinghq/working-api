import * as z from 'zod';
import { createWorkspaceSchema } from './create-workspace.dto.js';

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;
