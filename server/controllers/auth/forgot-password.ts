import { Request, Response } from 'express';
import {
  BadRequestError,
  RequestValidationError,
  ValidationError,
} from '../../../errors';
import { Password } from '../utils';
import { DateFormatter, Email, validateEmail } from '../../../utils';
import pgPool from '../../../db/pgPool';
import { clientBaseUrl } from '../../../config/baseUrls';

const errorLocation =
  'controllers/auth/google-auth/forgot-password.ts: forgotPassword';

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const emailValidation = validateEmail(email);
  if (emailValidation instanceof ValidationError) {
    throw new RequestValidationError([emailValidation], errorLocation);
  }

  const resetToken = Password.createPasswordResetToken();
  // 15 minutes
  const resetTokenExpires = DateFormatter.dateToTimestamp(
    new Date(Date.now() + 1000 * 60 * 15),
  );

  const forgotQuery = `
    UPDATE users
    SET password_reset_token=$1, password_reset_expires=TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI:SS')
    WHERE email=$3 AND confirmed=TRUE AND user_type='gogo'
    RETURNING email, first_name;
  `;
  const forgotParams = [
    Password.hashToken(resetToken),
    resetTokenExpires,
    email,
  ];
  const {
    rows: [user],
  } = await pgPool.query(forgotQuery, forgotParams);

  if (!user)
    throw new BadRequestError(
      'User with that email does not exist',
      errorLocation,
    );

  const resetPasswordLink = clientBaseUrl + '/reset-password/' + resetToken;

  const emailHelper = new Email(user, resetPasswordLink);
  await emailHelper.sendPasswordReset();

  res.status(200).send({ message: 'success' });
};
