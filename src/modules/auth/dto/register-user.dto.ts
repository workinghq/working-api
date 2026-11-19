import z from 'zod';

export const registerUserSchema = z.strictObject({
  name: z.string().min(3).max(50).trim(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
