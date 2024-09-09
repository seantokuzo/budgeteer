import { Response } from 'express';
import { JwtUtils } from './jwtUtils';

export const attachAuthCookie = (res: Response, jwt: string) => {
  res.cookie('token', jwt, {
    httpOnly: true,
    secure: false,
    expires: new Date(
      Date.now() + JwtUtils.jwtLifetimeToMs(process.env.JWT_LIFETIME!),
    ),
  });
};
