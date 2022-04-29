import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';

const baseUrl = '/api/users/signup';

describe(`Sign up)`, () => {
  let server: Server;

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();
  });

  it('returns created on successful signup', async () => {
    console.log(server.instance.address());
    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    expect(response.statusCode).toBe(StatusCodes.CREATED);
  });
});
