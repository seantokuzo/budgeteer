import jwt from 'jsonwebtoken';

export const createJwt = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};
