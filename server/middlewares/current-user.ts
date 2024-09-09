import { NextFunction, Request, Response } from 'express';
import { InternalError } from '../errors/internal-error';
import { JwtUtils } from '../utils';

declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: string;
  }
}

//middleware to check if there is a cookie
// if there is a cookie, we decode jwt and attach the current user id
export const currentUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { token } = req.cookies;

  if (!token) return next();

  const result = JwtUtils.decodeJwt(token);
  if (!result || result === 'expired' || result === 'malformed') {
    throw new InternalError('middlewares/current-user.ts: currentUser');
  }
  req.currentUser = result.userId;
  return next();
};
