import request from 'supertest';
import { app } from '../../../app';
import { baseAPIUrl } from '../../../config/baseUrls';
import pgPool from '../../../db/pgPool';
import { Password } from '../utils';
import { DateFormatter } from '../../../utils';

const resetPasswordUrl = baseAPIUrl + '/auth/gogo/reset-password';

describe('🧪 Reset Password Unit Tests', () => {
  it('Fails without a token URL query string', async () => {
    const response = await request(app).post(resetPasswordUrl).send();

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('token');
  });

  it('Fails without providing a new password', async () => {
    const response = await request(app)
      .post(resetPasswordUrl + '?token=fakeToken')
      .send();

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('password');
  });

  it('Fails when new password is invalid', async () => {
    const response = await request(app)
      .post(resetPasswordUrl + '?token=fakeToken')
      .send({
        newPassword: '2short',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('password');

    const response2 = await request(app)
      .post(resetPasswordUrl + '?token=fakeToken')
      .send({
        newPassword: 'toofreakingLonglonglonglonglonglonglonglonglong1234!',
      });

    expect(response2.status).toEqual(400);
    expect(response2.body[0].field).toEqual('password');

    const response3 = await request(app)
      .post(resetPasswordUrl + '?token=fakeToken')
      .send({
        newPassword: 'iforgotanumber!',
      });

    expect(response3.status).toEqual(400);
    expect(response3.body[0].field).toEqual('password');
  });

  it('Fails if user not found from token', async () => {
    const response = await request(app)
      .post(resetPasswordUrl + '?token=fakeToken')
      .send({
        newPassword: 'validPassword1234!',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'Password reset failed. Invalid token.',
    );
  });

  it('Fails if token is expired', async () => {
    const token = Password.createPasswordResetToken();
    const hashedToken = Password.hashToken(token);
    const expiredDate = DateFormatter.dateToTimestamp(
      new Date(Date.now() - 1000 * 60 * 60 * 24),
    );

    await pgPool.query(`
          INSERT INTO users (id, email, password, user_type, confirmed, password_reset_token, password_reset_expires)
          VALUES (99, 'forgetful@test.com', 'ilovetesting123!', 'gogo', TRUE, '${hashedToken}', TO_TIMESTAMP('${expiredDate}', 'YYYY-MM-DD HH24:MI:SS'));
      `);

    const response = await request(app)
      .post(resetPasswordUrl + `?token=${token}`)
      .send({
        newPassword: 'validPassword1234!',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'Password reset failed. Invalid token.',
    );
  });

  it('Fails if user is not confirmed', async () => {
    const token = Password.createPasswordResetToken();
    const hashedToken = Password.hashToken(token);
    const expiredDate = DateFormatter.dateToTimestamp(
      new Date(Date.now() + 1000 * 60 * 60 * 24),
    );

    await pgPool.query(`
          INSERT INTO users (id, email, password, user_type, confirmed, password_reset_token, password_reset_expires)
          VALUES (99, 'forgetful@test.com', 'ilovetesting123!', 'gogo', FALSE, '${hashedToken}', TO_TIMESTAMP('${expiredDate}', 'YYYY-MM-DD HH24:MI:SS'));
      `);

    const response = await request(app)
      .post(resetPasswordUrl + `?token=${token}`)
      .send({
        newPassword: 'validPassword1234!',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'Password reset failed. Invalid token.',
    );
  });

  it('Successfully reset password', async () => {
    const email = 'forgetful@test.com';
    const newPassword = 'fancyNewPassword1234!';
    const token = Password.createPasswordResetToken();
    const hashedToken = Password.hashToken(token);
    const expiryDate = DateFormatter.dateToTimestamp(
      new Date(Date.now() + 1000 * 60 * 60 * 24),
    );

    await pgPool.query(`
          INSERT INTO users (id, email, password, user_type, confirmed, password_reset_token, password_reset_expires)
          VALUES (99, '${email}', 'ilovetesting123!', 'gogo', TRUE, '${hashedToken}', TO_TIMESTAMP('${expiryDate}', 'YYYY-MM-DD HH24:MI:SS'));
      `);

    const response = await request(app)
      .post(resetPasswordUrl + `?token=${token}`)
      .send({
        newPassword,
      });

    const {
      rows: [user],
    } = await pgPool.query(`SELECT password FROM users WHERE email='${email}'`);

    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual('success');
    expect(await Password.comparePassword(newPassword, user.password)).toBe(
      true,
    );
  });
});
