import z from 'zod';

export const updateUserSchema = z
  .strictObject({
    name: z.string().min(3).max(100).trim().optional(),
    email: z.email().trim().toLowerCase().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: 'At least one field must be provided',
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
