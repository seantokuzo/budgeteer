export class ValidationError extends Error {
  msg: string;
  field: string;

  constructor(msg: string, field: string) {
    super(msg);

    this.msg = msg;
    this.field = field;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
