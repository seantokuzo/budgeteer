import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../errors/custom-error';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof CustomError) {
    console.log(`Error: ${err.message} @ ${err.location}`);
    return res.status(err.statusCode).send(err.serializeErrors());
  }

  console.log(`Unhandled Error caught: ${err.message}`);
  if (err.message === 'File too large') {
    return res.status(400).send([{ message: 'File is too large' }]);
  }
  return res
    .status(500)
    .send([{ message: 'Something went wrong, please try again later' }]);
};
