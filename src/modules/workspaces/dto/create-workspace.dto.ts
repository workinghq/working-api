import * as z from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(3).max(30),
  description: z.string().trim().min(10).max(200).optional(),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
