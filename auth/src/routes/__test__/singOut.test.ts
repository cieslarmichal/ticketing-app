import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';

const singUpUrl = '/api/users/signup';
const baseUrl = '/api/users/signout';

describe(`Sign out)`, () => {
  let server: Server;

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();
  });

  it('clears cookie after signing out', async () => {
    await request(server.instance).post(singUpUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    const response = await request(server.instance).post(baseUrl).send();

    expect(response.get('Set-Cookie')[0]).toBe('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
    expect(response.statusCode).toBe(StatusCodes.OK);
  });
});
