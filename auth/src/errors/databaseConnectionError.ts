export class DatabaseConnectionError extends Error {
  constructor() {
    super('Error connecting to database');
  }
}
