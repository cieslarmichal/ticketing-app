import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';

const singUpUrl = '/api/users/signup';
const baseUrl = '/api/users/signin';

describe(`Sign in)`, () => {
  let server: Server;

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();
  });

  it('returns bad request with missing body', async () => {
    const response = await request(server.instance).post(baseUrl).send({});

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns bad request with invalid email', async () => {
    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal',
      password: 'password',
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns not found when non existing email is provided', async () => {
    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns not found when incorrect password is provided', async () => {
    await request(server.instance).post(singUpUrl).send({
      email: 'michal@gmail.com',
      password: 'password1',
    });

    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password2',
    });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns ok when correct credentials are provided', async () => {
    await request(server.instance).post(singUpUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('should set cookie after successful sign in', async () => {
    await request(server.instance).post(singUpUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
