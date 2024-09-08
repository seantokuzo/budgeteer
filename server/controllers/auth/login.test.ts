import request from 'supertest';
import { app } from '../../app';

const gogoLoginUrl = '/api/v1/auth/gogo/login';

describe('🧪 Vanilla-Login Unit Tests 🧪', () => {
  it('🧪 Fails if either email or password are not provided', async () => {
    const { status: status1 } = await request(app).post(gogoLoginUrl).send({
      email: 'test@test.com',
    });

    expect(status1).toEqual(400);

    const { status: status2 } = await request(app).post(gogoLoginUrl).send({
      password: 'ilovetesting789',
    });

    expect(status2).toEqual(400);

    const response = await request(app).post(gogoLoginUrl).send();

    expect(response.status).toEqual(400);
    expect(response.body.length).toEqual(2);
  });

  it("🧪 Sets cookie 'token' on successful login", async () => {
    const { email, password } = await global.login();

    const response = await request(app).post(gogoLoginUrl).send({
      email,
      password,
    });

    expect(response.status).toEqual(200);
    expect(response.get('Set-Cookie')![0].split('=')[0]).toEqual('token');
  });
});
