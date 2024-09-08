import request from 'supertest';
import { app } from '../../../app';
import pgPool from '../../../db/pgPool';
import { Password } from '../utils';

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

  it('🧪 Fails if user does not exist', async () => {
    const { status } = await request(app).post(gogoLoginUrl).send({
      email: 'nonexistentuser@fail.com',
      password: 'pleaseLetMeIn1234',
    });

    expect(status).toEqual(400);
  });

  it("fails if user_type is not 'gogo'", async () => {
    const hashedPass = await Password.hashPassword('test1234');
    const {
      rows: [user],
    } = await pgPool.query(`
      INSERT INTO users (id, email, password, user_type, confirmed)
      VALUES (555, 'test@test.com', '${hashedPass}', 'google', FALSE)
      RETURNING email, password;
      `);

    const response = await request(app).post(gogoLoginUrl).send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'Account uses other means of authentication. Try logging in with Google',
    );
  });

  it('fails if user is not confirmed yet', async () => {
    const hashedPass = await Password.hashPassword('test1234');
    const {
      rows: [user],
    } = await pgPool.query(`
      INSERT INTO users (id, email, password, user_type, confirmed)
      VALUES (555, 'test@test.com', '${hashedPass}', 'gogo', FALSE)
      RETURNING email, password;
      `);

    const response = await request(app).post(gogoLoginUrl).send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      "Looks like you haven't confirmed your email yet. Check your email for a confirmation link",
    );
  });

  it('🧪 Fails if passwords do not match', async () => {
    const { email } = await login();

    const response = await request(app).post(gogoLoginUrl).send({
      email,
      password: 'wrongPassword',
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('Invalid credentials');
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
