import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pgPool from '../../../db/pgPool';
import {
  ValidationError,
  RequestValidationError,
  BadRequestError,
} from '../../../errors';
import { createJwt, attachAuthCookie, Password } from '../utils';
import { S3Utilities, validateEmail } from '../../../utils';
import { UserInterface } from '../../../db/types/user-type';
import { filterReturnedUser } from '../../../utils';
import { oauthList } from '../../../config/oauthList';

const errorLocation = 'controllers/auth/gogo-auth/login.ts';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // INPUT VALIDATION
  const validationErrors = [];
  const emailValidation = validateEmail(email);
  if (emailValidation instanceof ValidationError) {
    validationErrors.push(emailValidation);
  }
  if (!password || typeof password !== 'string') {
    validationErrors.push(
      new ValidationError('Provide a poper password', 'password'),
    );
  }
  if (validationErrors.length) {
    throw new RequestValidationError(validationErrors, errorLocation);
  }

  const userQuery = `SELECT * FROM users WHERE email=$1`;
  const userParams = [email];
  const {
    rows: [user],
  } = (await pgPool.query(userQuery, userParams)) as QueryResult<UserInterface>;
  if (!user)
    throw new BadRequestError(
      'No user associated with this email',
      errorLocation,
    );

  if (user.user_type !== 'gogo')
    throw new BadRequestError(
      `Account uses other means of authentication. Try logging in with ${oauthList.join(' / ')}`,
      errorLocation,
    );

  if (!user.confirmed) {
    throw new BadRequestError(
      "Looks like you haven't confirmed your email yet. Check your email for a confirmation link",
      errorLocation,
    );
  }

  const passwordsMatch = await Password.comparePassword(
    password,
    user.password!,
  );

  if (!passwordsMatch)
    throw new BadRequestError('Invalid credentials', errorLocation);

  const jwt = createJwt(user.id);
  attachAuthCookie(res, jwt);

  if (user.pfp) {
    user.pfp = await S3Utilities.getS3PresignedUrl(user.pfp);
  }
  res.status(200).send(filterReturnedUser(user));
};
