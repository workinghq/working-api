import * as z from 'zod';

export const createWorkspaceSchema = z.strictObject({
  name: z.string().trim().min(3).max(20),
  description: z.string().trim().min(10).max(100).optional(),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
