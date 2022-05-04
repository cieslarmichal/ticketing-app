import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Ticket } from '../../models';
import mongoose from 'mongoose';

const baseUrl = '/api/tickets';

describe(`Update ticket`, () => {
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

    const response = await request(server.instance).put(`${baseUrl}/${ticket.id}`).send({ title, price });

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('return forbidden when user does not own given ticket', async () => {
    const title = 'title';
    const price = 50;
    const userId = 'userId';

    const otherUserId = 'otherUserId';
    const email = 'email@gmail.com';

    const cookie = signUp({ email, id: otherUserId });

    const ticket = Ticket.build({ title, price, userId });
    await ticket.save();

    const response = await request(server.instance)
      .put(`${baseUrl}/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title, price });

    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
  });

  it('returns not found when invalid id is provided', async () => {
    const email = 'email@gmail.com';
    const id = 'asdasd';

    const cookie = signUp({ email, id });

    const title = 'title';
    const price = 50;

    const response = await request(server.instance).put(`${baseUrl}/xxx`).set('Cookie', cookie).send({ title, price });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns not found when ticket with given id does not exist', async () => {
    const email = 'email@gmail.com';
    const id = 'asdasd';
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const cookie = signUp({ email, id });

    const title = 'title';
    const price = 50;

    const response = await request(server.instance)
      .put(`${baseUrl}/${ticketId}`)
      .set('Cookie', cookie)
      .send({ title, price });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns bad request when invalid price is provided', async () => {
    const title = 'title';
    const price = 50;
    const userId = 'userId';

    const ticket = Ticket.build({ title, price, userId });
    await ticket.save();

    const email = 'email@gmail.com';
    const id = 'asdasd';

    const updatedPrice = 'xxx';

    const cookie = signUp({ email, id });

    const response = await request(server.instance)
      .put(`${baseUrl}/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title, price: updatedPrice });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('updates and returns a ticket when ticket with given id exists', async () => {
    const title = 'title';
    const price = 50;
    const userId = 'userId';

    const ticket = Ticket.build({ title, price, userId });
    await ticket.save();

    const email = 'email@gmail.com';

    const cookie = signUp({ email, id: userId });

    const updatedTitle = 'title2';
    const updatedPrice = 70;

    const response = await request(server.instance)
      .put(`${baseUrl}/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title: updatedTitle, price: updatedPrice });

    expect(response.statusCode).toBe(StatusCodes.OK);

    expect(response.body.title).toBe(updatedTitle);
    expect(response.body.price).toBe(updatedPrice);
    expect(response.body.userId).toBe(userId);
  });
});
