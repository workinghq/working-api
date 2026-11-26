import z from 'zod';

export const updatePasswordSchema = z.strictObject({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
