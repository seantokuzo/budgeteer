import request from 'supertest';
import { app } from '../app';
import pgPool from '../db/pgPool';
import { Password } from '../controllers/auth/utils';

interface globalLoginInterface {
  cookie: string[];
}

declare global {
  function login(): Promise<globalLoginInterface>;
}

beforeAll(async () => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
});

beforeEach(async () => {
  jest.clearAllMocks();
  await pgPool.query(`
    DO
    $$
    DECLARE
        table_name text;
    BEGIN
        FOR table_name IN
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
        LOOP
            EXECUTE format('TRUNCATE TABLE %I CASCADE;', table_name);
        END LOOP;
    END
    $$;
   `);
});

afterAll(async () => {
  pgPool.end();
});

global.login = async () => {
  const userId = 99;
  const email = 'test@test.com';
  const username = 'test_username';
  const password = 'donuts';
  const location = 'test_location';
  const bio = 'test_bio';
  const hashedPass = await Password.hashPassword(password);

  await pgPool.query(`INSERT INTO users (id, email, username, location, bio, password, user_type, is_active, confirmed) VALUES
  (${userId}, '${email}', '${username}', '${location}', '${bio}', '${hashedPass}', 'gogo', TRUE, TRUE);`);

  const response = await request(app)
    .post('/api/v1/auth/gogo/login')
    .send({
      email,
      password,
    })
    .expect(200);

  const cookie = response.get('Set-Cookie') as string[];

  return { cookie, userId, email, password, username, location, bio };
};
