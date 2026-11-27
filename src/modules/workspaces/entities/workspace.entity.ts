export class Workspace {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
