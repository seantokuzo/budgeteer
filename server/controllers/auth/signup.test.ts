import request from 'supertest';
import { app } from '../../app';
import { baseAPIUrl } from '../../config/baseUrls';

const signupUrl = baseAPIUrl + '/auth/signup';

describe('🧪 Signup Unit Tests 🧪', () => {
  it('throws an error with invalid password', async () => {
    const response = await request(app).post(signupUrl).send();

    expect(response.status).toEqual(400);
  });
});
