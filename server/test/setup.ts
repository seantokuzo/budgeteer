import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';

interface globalLoginInterface {
  cookie: string[];
  email: string;
  password: string;
}

declare global {
  function login(): Promise<globalLoginInterface>;
}

beforeAll(async () => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  await mongoose.connect(
    'mongodb://budgeteer-mongo-test:27017/budgeteer-testdb',
    {},
  );
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db!.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

global.login = async () => {
  const email = 'test@test.com';
  const password = 'test1234';

  const response = await request(app)
    .post('/api/v1/auth/gogo/signup')
    .send({
      email,
      password,
    })
    .expect(200);

  const cookie = response.get('Set-Cookie') as string[];

  return { cookie, email, password };
};
