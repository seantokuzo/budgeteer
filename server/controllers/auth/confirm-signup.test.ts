import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../../app';
import pgPool from '../../../db/pgPool';
import { clientBaseUrl } from '../../../config/baseUrls';
import { Email } from '../../../utils';

const sendWelcomeEmailMock = jest
  .spyOn(Email.prototype, 'sendWelcomeEmail')
  .mockImplementation(async () => undefined)
  .mockName('MOCK Email.sendWelcomeEmail');

const gogoConfirmSignupUrl = '/api/v1/auth/gogo/confirm';

const createToken = (id: number, time: string) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET!, {
    expiresIn: time,
  });
};

describe('🧪 Vanilla Confirm Signup Unit Tests 🧪', () => {
  const id = 999;
  const email = 'test@test.com';
  beforeEach(async () => {
    await pgPool.query(
      `
      INSERT INTO users (id, email, user_type, is_active, confirmed)
      VALUES (${id}, '${email}', 'gogo', FALSE, FALSE);
    `,
    );
  });

  it('🧪 Fails if no valid request query token', async () => {
    const response = await request(app).get(gogoConfirmSignupUrl).send();

    expect(response.status).toEqual(400);
  });

  it('🧪 Fails if token is malformed', async () => {
    const response = await request(app)
      .get(`${gogoConfirmSignupUrl}?token=gobbleDeeGoop`)
      .send();

    expect(response.status).toEqual(400);
  });

  it('🧪 throws an error if user is not found when updating', async () => {
    const badToken = createToken(1234567890, '1d');

    const response = await request(app)
      .get(`${gogoConfirmSignupUrl}?token=${badToken}`)
      .send();

    expect(response.status).toEqual(500);
  });

  it('🧪 Redirects to "/confirmation-expired" if token is expired', async () => {
    const token = createToken(id, '0');

    const response = await request(app)
      .get(`${gogoConfirmSignupUrl}?token=${token}`)
      .send();

    expect(response.get('Location')).toEqual(
      `${clientBaseUrl}/confirmation-expired`,
    );
    expect(response.status).toEqual(302);
  });

  it('Confirms and activates user on successful confirmation', async () => {
    const token = createToken(id, '1d');

    const response = await request(app)
      .get(`${gogoConfirmSignupUrl}?token=${token}`)
      .send();

    const {
      rows: [confirmedUser],
    } = await pgPool.query(`
          SELECT * FROM users WHERE id=${id}
      `);

    expect(response.status).toEqual(302);
    expect(confirmedUser.is_active).toBe(true);
    expect(confirmedUser.confirmed).toBe(true);
  });

  it('Sends welcome email, sets auth cookie and redirects to homepage on successful confirmation', async () => {
    const token = createToken(id, '1d');

    const response = await request(app)
      .get(`${gogoConfirmSignupUrl}?token=${token}`)
      .send();

    expect(sendWelcomeEmailMock).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(302);
    expect(response.get('Location')).toEqual(clientBaseUrl + '/confirmed');

    expect(response.get('Set-Cookie')![0].split('=')[0]).toEqual('token');
  });
});
