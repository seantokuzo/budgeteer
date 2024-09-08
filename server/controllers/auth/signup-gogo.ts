import { Request, Response } from 'express';
import pgPool from '../../../db/pgPool';
import {
  ValidationError,
  RequestValidationError,
  BadRequestError,
  InternalError,
} from '../../../errors';
import { Password, createJwt } from '../utils';
import {
  Email,
  validateEmail,
  validatePassword,
  validateUsername,
  jwtLifetimeToMs,
} from '../../../utils';
import { UserInterface } from '../../../db/types/user-type';
import { QueryResult } from 'pg';

const errorLocation = 'controllers/auth/gogo-auth/signup.ts';

export const signup = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  // INPUT VALIDATION
  const validationErrors = <ValidationError[]>[];
  const validations = [
    validateEmail(email),
    validateUsername(username),
    validatePassword(password),
  ];
  validations.forEach((v) => {
    if (v instanceof ValidationError) validationErrors.push(v);
  });
  if (validationErrors.length) {
    throw new RequestValidationError(validationErrors, errorLocation);
  }

  // CHECK IF EXISTING USER CASES
  const existingUserQuery = `
    SELECT * FROM users WHERE email=$1 OR username=$2;
  `;
  const existingUserValues = [email, username];
  const {
    rows: [existingUser],
  } = (await pgPool.query(
    existingUserQuery,
    existingUserValues,
  )) as QueryResult<UserInterface>;

  // *** EXISTING USER CHECKS ***
  // 1) EXISTING USER IS CONFIRMED
  if (existingUser && existingUser.confirmed) {
    // If confirmed user matches request email
    if (existingUser.email === email) {
      throw new BadRequestError(
        'User with this email already exists',
        errorLocation,
      );
    } else {
      // If confirmed user matches request username - not email
      throw new BadRequestError('Username is taken', errorLocation);
    }
  }
  // 2) EXISTING USER NOT CONFIRMED
  if (existingUser && !existingUser.confirmed) {
    const expiryTime = jwtLifetimeToMs(process.env.JWT_CONFIRM_LIFETIME!);
    const existingUserExpired =
      new Date(existingUser.created_at).getTime() + expiryTime <
      new Date().getTime();
    // If existing user email === request email
    if (existingUser.email === email) {
      await pgPool.query(
        `
        DELETE FROM users WHERE email=$1;
        `,
        [email],
      );
      // If existing user username === request username (emails don't match)
    } else {
      // -- if existing user confirmation token not expired
      if (!existingUserExpired) {
        throw new BadRequestError('Username is taken', errorLocation);
        // if existing user confirmation token is expired
      } else {
        await pgPool.query(
          `
          DELETE FROM users WHERE username=$1;
        `,
          [username],
        );
      }
    }
  }

  // CREATE USER, IS_ACTIVE FALSE
  const hashedPass = await Password.hashPassword(password);
  const signupQuery = `
    INSERT INTO users (username, email, password, user_type)
    VALUES($1, $2, $3, 'gogo')
    RETURNING id, username, email, first_name, user_type;
  `;
  const signupValues = [username, email, hashedPass];
  const {
    rows: [newUser],
  } = await pgPool.query(signupQuery, signupValues);

  if (!newUser) throw new InternalError(errorLocation);

  // SEND CONFIRMATION EMAIL WITH TOKEN LINK
  const confirmationToken = createJwt(newUser.id, false);
  const url = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/auth/gogo/confirm?token=${confirmationToken}`;
  const emailHelper = new Email(newUser, url);
  await emailHelper.sendSignupConfirmation();

  res
    .status(201)
    .send({ message: 'Thank you for signing up! Please confirm your email' });
};
