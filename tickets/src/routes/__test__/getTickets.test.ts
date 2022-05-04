import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Ticket } from '../../models';

const baseUrl = '/api/tickets';

describe(`Get tickets`, () => {
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
    const userId = 'userId';

    const ticket = Ticket.build({ title, price, userId });
    await ticket.save();

    const response = await request(server.instance).get(baseUrl).send();

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns tickets', async () => {
    const title = 'title';
    const price = 50;

    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const ticket1 = Ticket.build({ title, price, userId: id });
    await ticket1.save();

    const ticket2 = Ticket.build({ title, price, userId: id });
    await ticket2.save();

    const response = await request(server.instance).get(baseUrl).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.length).toBe(2);
  });
});
