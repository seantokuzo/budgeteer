import request from 'supertest';
import { app } from '../../app';

describe('🧪 Logout Unit Tests 🧪', () => {
  it('🧪 Successfully logs out user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .send()
      .expect(200);

    console.log(response.get('Set-Cookie'));

    expect(response.body.message).toEqual('success');
    expect(response.get('Set-Cookie')).toBeDefined();
    expect(/null/g.test(response.get('Set-Cookie')![0].split(';')[0])).toEqual(
      true,
    );
  });
});
