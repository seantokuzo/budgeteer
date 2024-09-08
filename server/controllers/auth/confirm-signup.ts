import { Request, Response } from 'express';
import pgPool from '../../../db/pgPool';
import { BadRequestError, InternalError } from '../../../errors';
import { attachAuthCookie, createJwt } from '../utils';
import { Email, decodeJwt } from '../../../utils';
import { clientBaseUrl } from '../../../config/baseUrls';

const errorLocation = 'controllers/auth/gogo-auth/confirm-signup.ts';

export const confirmSignup = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) throw new BadRequestError('Invalid token', errorLocation);

  const result = decodeJwt(`${token}`);
  if (!result || result === 'malformed') {
    throw new BadRequestError(
      'Invalid confirmation token. Please try signing up again.',
      errorLocation,
    );
  }
  if (result === 'expired') {
    return res.redirect(clientBaseUrl + '/confirmation-expired');
  }

  const existingUserQuery = `
  SELECT * FROM users WHERE id=$1 AND confirmed=TRUE;
  `;
  const existingUserParams = [result.userId];
  const {
    rows: [existingUser],
  } = await pgPool.query(existingUserQuery, existingUserParams);

  if (existingUser) {
    const jwt = createJwt(existingUser.id);
    attachAuthCookie(res, jwt);
    return res.redirect(clientBaseUrl + '/landing');
  }

  const confirmQuery = `
  UPDATE users
  SET is_active = TRUE, confirmed = TRUE, updated_at = NOW()
  WHERE id=$1
  RETURNING id, email
  `;
  const confirmParams = [result.userId];
  const {
    rows: [confirmedUser],
  } = await pgPool.query(confirmQuery, confirmParams);

  if (!confirmedUser) {
    throw new InternalError(errorLocation);
  }

  const emailHelper = new Email(confirmedUser, clientBaseUrl);
  await emailHelper.sendWelcomeEmail();

  const jwt = createJwt(confirmedUser.id);
  attachAuthCookie(res, jwt);

  res.redirect(clientBaseUrl + '/confirmed');
};
