import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Order, Ticket } from '../../models';
import mongoose from 'mongoose';
import { OrderStatus } from '@cieslar-ticketing-common/common';
// import { natsClient } from '../../shared';

const baseUrl = '/api/orders';

describe(`Create order`, () => {
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
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const response = await request(server.instance).post(baseUrl).send({ ticketId });

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns bad request when ticketId is not provided', async () => {
    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns not found when provided ticketId is not uuid', async () => {
    const ticketId = 'abc';

    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ ticketId });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns not found when ticket with corresponding ticketId does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ ticketId });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns unprocessable entity when ticket is already assigned to another order', async () => {
    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const title = 'title';
    const price = 50;

    const ticket = Ticket.build({ title, price });
    await ticket.save();

    const order = Order.build({ userId: id, status: OrderStatus.Created, expiresAt: new Date(), ticket });
    await order.save();

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ ticketId: ticket.id });

    expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('creates an order when valid inputs are provided', async () => {
    let orders = await Order.find({});
    expect(orders.length).toEqual(0);

    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const title = 'title';
    const price = 50;

    const ticket = Ticket.build({ title, price });
    await ticket.save();

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ ticketId: ticket.id });

    expect(response.statusCode).toBe(StatusCodes.CREATED);

    orders = await Order.find({});
    expect(orders.length).toEqual(1);

    expect(orders[0].userId).toBe(id);
    expect(orders[0].ticket._id.toString()).toBe(ticket.id);

    expect(response.body.userId).toBe(id);
    expect(response.body.ticket.id).toBe(ticket.id);

    // expect(natsClient.client.publish).toHaveBeenCalled();
  });
});
