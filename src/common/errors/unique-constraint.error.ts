export class UniqueConstraintError extends Error {
  constructor() {
    super('Unique constraint violation');
    this.name = 'UniqueConstraintError';
  }
}
