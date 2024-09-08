import { CustomError } from './custom-error';
import { ValidationError } from './validation-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(
    public errors: ValidationError[],
    public location: string,
  ) {
    super('❌ Request Validation Failed', location);

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.field };
    });
  }
}
