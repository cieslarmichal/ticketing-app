export abstract class CustomError extends Error {
  public abstract statusCode: number;

  public constructor(message: string) {
    super(message);
  }

  abstract serialize(): Array<{ message: string; field?: string }>;
}
