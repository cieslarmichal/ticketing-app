import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';

const baseUrl = '/api/users/currentuser';

describe(`Current user)`, () => {
  let server: Server;

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();
  });

  it('returns current user information', async () => {
    const email = 'email@gmail.com';
    const password = 'password';

    const cookie = await signUp({ email, password }, server.instance);

    const response = await request(server.instance).get(baseUrl).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.currentUser.email).toBe(email);
  });

  it('returns null when user is not authenticated', async () => {
    const response = await request(server.instance).get(baseUrl).send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.currentUser).toBeNull();
  });
});
