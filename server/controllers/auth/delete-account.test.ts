import request from 'supertest';
import { baseAPIUrl } from '../../config/baseUrls';
import { app } from '../../app';

const deleteAccountUrl = baseAPIUrl + '/auth/delete-account';

describe('🧪 Delete Account Test 🧪', () => {
  it('Fails with 401 when not authenticated', async () => {
    const response = await request(app).delete(deleteAccountUrl).send();

    expect(response.status).toEqual(401);
  });
});
