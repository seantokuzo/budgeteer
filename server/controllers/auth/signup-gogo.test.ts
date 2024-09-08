import request from 'supertest';
import { app } from '../../../app';
import pgPool from '../../../db/pgPool';
import { Email } from '../../../utils';
import { DateFormatter } from '../../../utils';

/*eslint jest/no-disabled-tests: "off" */

const sendSignupConfirmationMock = jest
  .spyOn(Email.prototype, 'sendSignupConfirmation')
  .mockImplementation(async () => undefined)
  .mockName('MOCK Email.sendSignupConfirmation');

const signupUrl = '/api/v1/auth/gogo/signup';

const validUser = {
  email: 'test@test.com',
  username: 'coolUser89',
  password: 'validPassword1234!',
};

interface Options {
  user_type: 'gogo' | 'google';
  confirmed: boolean;
  created_at?: Date;
}

const insertValidUser = async (user: typeof validUser, options: Options) => {
  await pgPool.query(
    `
          INSERT INTO users (id, email, username, user_type, is_active, confirmed${options.created_at ? ', created_at' : ''})
          VALUES (222, $1, $2, $3, $4, $5${options.created_at ? `, TO_TIMESTAMP('${DateFormatter.dateToTimestamp(options.created_at)}', 'YYYY-MM-DD HH24:MI:SS')` : ''});
      `,
    [user.email, user.username, options.user_type, true, options.confirmed],
  );
};

describe('🧪 Vanilla-Signup Unit Tests 🧪', () => {
  beforeEach(() => {
    sendSignupConfirmationMock.mockClear();
  });

  describe('🧪 Input Validation Tests 🧪', () => {
    // EMAIL VALIDATIONS
    it('throws an error for invalid emails', async () => {
      const badEmails = ['notAnEmail', 'almostAnEmail@testcom'];
      for (const email of badEmails) {
        const response = await request(app)
          .post(signupUrl)
          .send({
            ...validUser,
            email,
          });

        expect(response.status).toEqual(400);
        expect(response.body[0].field).toEqual('email');
      }
    });
    // PASSWORD VALIDATIONS
    it('throws an error with invalid password', async () => {
      const badPasswords = [
        'ilovetesting789', // no special characters
        '2Short', // pass < 7
        'wowThis1Password!isWayTooLongLONG', // pass > 30
      ];
      for (const password of badPasswords) {
        const response1 = await request(app)
          .post(signupUrl)
          .send({
            ...validUser,
            password,
          });

        expect(response1.status).toEqual(400);
        expect(response1.body[0].field).toEqual('password');
      }
    });
    // USERNAME VALIDATION
    it('returns both validation errors for invalid username', async () => {
      const response = await request(app)
        .post(signupUrl)
        .send({
          ...validUser,
          username: '***derpdee',
        });

      expect(response.status).toEqual(400);
      expect(response.body[0].field).toEqual('Username');
    });

    // MULTIPLE VALIDATION FAILS
    it('Return validation errors for multiple invalid inputs', async () => {
      const response = await request(app)
        .post(signupUrl)
        .send({
          ...validUser,
          email: 'notAnEmail',
          username: '***derpdee',
          password: '2short',
        });
      const fields = response.body.map(
        (err: { message: string; field: string }) => err.field,
      );

      expect(response.status).toEqual(400);
      expect(fields.includes('email')).toBe(true);
      expect(fields.includes('password')).toBe(true);
      expect(fields.includes('Username')).toBe(true);
    });
  });

  // ROUTE LOGIC TESTS
  describe('🧪 Route Logic Tests 🧪', () => {
    // existingUser.confirmed && existingUser.email = req.email -> Error 'User with email already exists'
    it('Returns an error if confirmed user with email exists', async () => {
      await insertValidUser(validUser, {
        user_type: 'gogo',
        confirmed: true,
      });

      const response = await request(app).post(signupUrl).send(validUser);

      expect(response.status).toEqual(400);
      expect(response.body[0].message).toEqual(
        'User with this email already exists',
      );
    });

    // existingUser.confirmed && existingUser.username = req.username -> Error 'username taken'
    it('Returns an error if username is taken by a confirmed user', async () => {
      await insertValidUser(
        { ...validUser, email: 'differentUser@test.com' },
        {
          user_type: 'gogo',
          confirmed: true,
        },
      );

      const response = await request(app).post(signupUrl).send(validUser);

      expect(response.status).toEqual(400);
      expect(response.body[0].message).toEqual('Username is taken');
    });

    // existingUser confirmation expired -> Delete existingUser (by email or username) and send confirmation email
    it('Deletes unconfirmed existing user with expired token and sends confirmation email', async () => {
      await insertValidUser(
        {
          ...validUser,
          email: 'differentUser@test.com',
        },
        {
          user_type: 'gogo',
          confirmed: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        },
      );

      const response = await request(app).post(signupUrl).send(validUser);
      const { rows } = await pgPool.query(
        `SELECT * FROM users WHERE email='differentUser@test.com';`,
      );

      expect(response.status).toEqual(201);
      expect(sendSignupConfirmationMock).toHaveBeenCalledTimes(1);
      expect(rows.length).toBe(0);
    });

    // existingUser not confirmed && confirmation valid && different email -> Error 'username taken'
    it('Returns an error if username is taken by an unconfirmed user with different email and valid confirmation', async () => {
      await insertValidUser(
        {
          ...validUser,
          email: 'differentUser@test.com',
        },
        {
          user_type: 'gogo',
          confirmed: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12),
        },
      );

      const response = await request(app).post(signupUrl).send(validUser);

      expect(response.status).toEqual(400);
      expect(response.body[0].message).toEqual('Username is taken');
    });

    // existingUser not confirmed && confirmation valid && same email && same username -> delete existingUser (by email) and resend confirmation email
    it('Deletes existing unconfirmed user with valid token and resends confirmation email if emails are the same', async () => {
      await insertValidUser(validUser, {
        user_type: 'gogo',
        confirmed: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12),
      });

      const response = await request(app).post(signupUrl).send(validUser);
      const { rows } = await pgPool.query(
        `SELECT * FROM users WHERE email='${validUser.email}';`,
      );

      expect(response.status).toEqual(201);
      expect(sendSignupConfirmationMock).toHaveBeenCalledTimes(1);
      expect(rows.length).toBe(1);
      expect(rows[0].username).toBe(validUser.username);
    });

    // existingUser not confirmed && confirmation valid && same email && different username -> delete existingUser (by email) and resend confirmation email
    it('Deletes unconfirmed user with valid token and resends confirmation email if emails are the same regardless of usernames', async () => {
      await insertValidUser(validUser, {
        user_type: 'gogo',
        confirmed: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12),
      });

      const response = await request(app)
        .post(signupUrl)
        .send({ ...validUser, username: 'differentUsername' });

      const {
        rows: [sameUserDiffUsername],
      } = await pgPool.query(
        `SELECT * FROM users WHERE email='${validUser.email}';`,
      );
      const { rows } = await pgPool.query(
        `SELECT * FROM users WHERE username='${validUser.username}';`,
      );

      expect(response.status).toEqual(201);
      expect(sendSignupConfirmationMock).toHaveBeenCalledTimes(1);
      expect(sameUserDiffUsername.email).toEqual(validUser.email);
      expect(sameUserDiffUsername.username).toEqual('differentUsername');
      expect(rows.length).toBe(0);
    });

    // PLAIN OLD SUCCESS
    it('Successfully creates user and sends signup confirmation email', async () => {
      const response = await request(app).post(signupUrl).send(validUser);

      expect(response.status).toEqual(201);

      const query = `SELECT * FROM users WHERE email=$1;`;
      const {
        rows: [newUser],
      } = await pgPool.query(query, [validUser.email]);
      expect(newUser).toBeDefined();
      expect(newUser.email).toEqual(validUser.email);

      expect(sendSignupConfirmationMock).toHaveBeenCalledTimes(1);
    });
  });
});
