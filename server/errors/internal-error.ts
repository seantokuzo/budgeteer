import { CustomError } from './custom-error';

export class InternalError extends CustomError {
  statusCode = 500;

  constructor(public location: string) {
    super('❌ Something went wrong', location);

    Object.setPrototypeOf(this, InternalError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Something went wrong, please try again later' }];
  }
}
