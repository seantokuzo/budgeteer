export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(
    message: string,
    public location: string,
  ) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
