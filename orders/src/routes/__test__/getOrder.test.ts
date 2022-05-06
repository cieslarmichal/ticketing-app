import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Order, Ticket } from '../../models';
import mongoose from 'mongoose';
import { OrderStatus } from '@cieslar-ticketing-common/common';

const baseUrl = '/api/orders';

describe(`Get order`, () => {
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
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const response = await request(server.instance).get(`${baseUrl}/${orderId}`).send();

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns not found when orderId is not uuid', async () => {
    const orderId = '123';

    const email = 'email@gmail.com';
    const id = 'asdasd';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).get(`${baseUrl}/${orderId}`).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns not found when order with given id does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const email = 'email@gmail.com';
    const id = 'asdasd';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).get(`${baseUrl}/${orderId}`).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns forbidden when user requests order which he does not own', async () => {
    const email = 'email@gmail.com';
    const userId = '1';
    const otherUserId = '2';

    const cookie = signUp({ email, id: otherUserId });

    const title = 'title';
    const price = 50;

    const ticket = Ticket.build({ title, price });
    await ticket.save();

    const order = Order.build({ userId, status: OrderStatus.Created, expiresAt: new Date(), ticket });
    await order.save();

    const response = await request(server.instance).get(`${baseUrl}/${order.id}`).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
  });

  it('returns an order when order with given id exists', async () => {
    const email = 'email@gmail.com';
    const userId = '1';

    const cookie = signUp({ email, id: userId });

    const title = 'title';
    const price = 50;

    const ticket = Ticket.build({ title, price });
    await ticket.save();

    const order = Order.build({ userId, status: OrderStatus.Created, expiresAt: new Date(), ticket });
    await order.save();

    const response = await request(server.instance).get(`${baseUrl}/${order.id}`).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    expect(response.body.userId).toBe(userId);
    expect(response.body.status).toBe(OrderStatus.Created);
    expect(response.body.ticket.id).toBe(ticket.id);
  });
});
