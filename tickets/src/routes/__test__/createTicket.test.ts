import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';

const baseUrl = '/api/tickets';

describe(`Create ticket)`, () => {
  let server: Server;

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();
  });

  it('requires authentication', async () => {
    const title = 'title';
    const price = 50;

    const response = await request(server.instance).post(baseUrl).send({ title, price });

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns error when title is not provided', async () => {
    const price = 50;

    const email = 'email@gmail.com';

    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ price });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns error when invalid price is provided', async () => {
    const title = 'title';
    const price = 'asdadas';

    const email = 'email@gmail.com';

    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ title, price });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('creates a ticket when valid inputs are provided', async () => {
    const title = 'title';
    const price = 50;

    const email = 'email@gmail.com';

    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ title, price });

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body.title).toBe(title);
    expect(response.body.price).toBe(title);
  });
});
