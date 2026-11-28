export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public emailVerified: boolean,
    public passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public avatarUrl?: string,
  ) {}
}
