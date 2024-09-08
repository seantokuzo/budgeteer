import { Request, Response } from 'express';
import {
  BadRequestError,
  RequestValidationError,
  ValidationError,
} from '../../../errors';
import { Password } from '../utils';
import { validatePassword } from '../../../utils';
import pgPool from '../../../db/pgPool';

const errorLocation = 'controllers/auth/gogo-auth/reset-password.ts';

export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  const { token } = req.query;

  // Validations
  if (!token || typeof token !== 'string') {
    throw new RequestValidationError(
      [new ValidationError('Invalid token', 'token')],
      errorLocation,
    );
  }

  const validPassword = validatePassword(newPassword);
  if (validPassword instanceof ValidationError) {
    throw new RequestValidationError([validPassword], errorLocation);
  }

  // Update Password
  const resetQuery = `
    UPDATE users
    SET password=$1, password_reset_token=NULL, password_reset_expires=NULL, updated_at=NOW()
    WHERE password_reset_token=$2 AND password_reset_expires > NOW() AND confirmed=TRUE
    RETURNING id, email
  `;
  const resetParams = [
    await Password.hashPassword(newPassword),
    Password.hashToken(token),
  ];
  const {
    rows: [user],
  } = await pgPool.query(resetQuery, resetParams);

  if (!user)
    throw new BadRequestError(
      'Password reset failed. Invalid token.',
      errorLocation,
    );

  res.status(200).send({ message: 'success' });
};
