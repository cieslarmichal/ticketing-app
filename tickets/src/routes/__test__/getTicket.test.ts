import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Ticket } from '../../models';
import mongoose from 'mongoose';

const baseUrl = '/api/tickets';

describe(`Get ticket`, () => {
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

    const response = await request(server.instance).get(`${baseUrl}/${ticket.id}`).send();

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns not found when invalid id is provided', async () => {
    const email = 'email@gmail.com';
    const id = 'asdasd';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).get(`${baseUrl}/xxx`).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns not found when ticket with given id does not exist', async () => {
    const email = 'email@gmail.com';
    const id = 'asdasd';
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const cookie = signUp({ email, id });

    const response = await request(server.instance).get(`${baseUrl}/${ticketId}`).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns a ticket when ticket with given id exists', async () => {
    const title = 'title';
    const price = 50;

    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const ticket = Ticket.build({ title, price, userId: id });
    await ticket.save();

    const response = await request(server.instance).get(`${baseUrl}/${ticket.id}`).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    expect(response.body.title).toBe(title);
    expect(response.body.price).toBe(price);
    expect(response.body.userId).toBe(id);
  });
});
