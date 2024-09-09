import request from 'supertest';
import { app } from '../../app';
import { baseAPIUrl } from '../../config/baseUrls';

const logoutUrl = baseAPIUrl + '/auth/logout';

describe('🧪 Logout Unit Tests 🧪', () => {
  it('🧪 Successfully logs out user', async () => {
    const response = await request(app).post(logoutUrl).send().expect(200);

    expect(response.body.message).toEqual('success');
    expect(response.get('Set-Cookie')).toBeDefined();
    expect(/null/g.test(response.get('Set-Cookie')![0].split(';')[0])).toEqual(
      true,
    );
  });
});
