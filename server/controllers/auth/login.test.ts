import request from 'supertest';
import { app } from '../../app';
import { baseAPIUrl } from '../../config/baseUrls';

const loginUrl = baseAPIUrl + '/auth/login';

describe('🧪 Vanilla-Login Unit Tests 🧪', () => {
  it('🧪 Fails if either email or password are not provided', async () => {
    const badBodies = [
      { email: 'test@test.com' },
      { password: 'testpass1234' },
    ];

    for (const body of badBodies) {
      const { status } = await request(app).post(loginUrl).send(body);
      expect(status).toEqual(400);
    }
  });
});
