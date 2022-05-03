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
    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    expect(response.statusCode).toBe(StatusCodes.CREATED);
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

  it('returns bad request with invalid password', async () => {
    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal',
      password: '1',
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should not create user when user with given email already exists', async () => {
    await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('should set cookie after successful signup', async () => {
    const response = await request(server.instance).post(baseUrl).send({
      email: 'michal@gmail.com',
      password: 'password',
    });

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
