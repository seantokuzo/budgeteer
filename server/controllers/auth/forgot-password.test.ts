import request from 'supertest';
import { app } from '../../../app';
import { Email } from '../../../utils';
import { baseAPIUrl } from '../../../config/baseUrls';
import pgPool from '../../../db/pgPool';

const sendPasswordResetMock = jest
  .spyOn(Email.prototype, 'sendPasswordReset')
  .mockImplementation(async () => undefined)
  .mockName('Email.sendPasswordResetMock');

const forgotPasswordUrl = baseAPIUrl + '/auth/gogo/forgot-password';

describe('🧪 Forgot Password Unit Tests', () => {
  it('Fails with 401 if no email provided', async () => {
    const response = await request(app).post(forgotPasswordUrl).send();

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('Please provide a valid email');
  });

  it('Fails if user does not exist', async () => {
    const response = await request(app).post(forgotPasswordUrl).send({
      email: 'not_a_user@test.com',
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'User with that email does not exist',
    );
  });

  it('Fails if user is not confirmed yet', async () => {
    const email = 'notConfirmed@test.com';
    await pgPool.query(`
        INSERT INTO users (id, email, password, confirmed, user_type)
        VALUES (111, '${email}', 'derp1234!', FALSE, 'gogo');
      `);

    const response = await request(app).post(forgotPasswordUrl).send({
      email,
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'User with that email does not exist',
    );
  });

  it('fails if user is not a gogo user type', async () => {
    const email = 'notConfirmed@test.com';
    await pgPool.query(`
        INSERT INTO users (id, email, password, confirmed, user_type)
        VALUES (111, '${email}', 'derp1234!', TRUE, 'google');
      `);

    const response = await request(app).post(forgotPasswordUrl).send({
      email,
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'User with that email does not exist',
    );
  });

  it('Sends password reset email and creates resetToken on successful request', async () => {
    const { email } = await login();

    const response = await request(app).post(forgotPasswordUrl).send({
      email,
    });

    const {
      rows: [user],
    } = await pgPool.query(`SELECT * FROM users WHERE email='${email}'`);

    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual('success');

    expect(user.password_reset_expires).toBeTruthy();
    expect(user.password_reset_token).toBeTruthy();
    expect(sendPasswordResetMock).toHaveBeenCalledTimes(1);
  });
});
