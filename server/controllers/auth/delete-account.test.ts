import request from 'supertest';
import { baseAPIUrl } from '../../config/baseUrls';
import { app } from '../../app';
import pgPool from '../../db/pgPool';

const deleteAccountUrl = baseAPIUrl + '/auth/delete-account';

describe('🧪 Delete Account Test 🧪', () => {
  it('Fails with 401 when not authenticated', async () => {
    const response = await request(app).delete(deleteAccountUrl).send();

    expect(response.status).toEqual(401);
  });

  it('Successfully deletes account when authenticated', async () => {
    const { cookie, email } = await login();

    const response = await request(app)
      .delete(deleteAccountUrl)
      .set('Cookie', cookie)
      .send();

    const {
      rows: [deletedUser],
    } = await pgPool.query(`
        SELECT * FROM users WHERE email='${email}'
      `);

    expect(deletedUser).toBeUndefined();
    expect(response.status).toEqual(200);
  });
});
