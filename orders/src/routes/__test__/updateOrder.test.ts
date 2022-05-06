import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Order, Ticket } from '../../models';
import mongoose from 'mongoose';
import { OrderStatus } from '@cieslar-ticketing-common/common';

const baseUrl = '/api/orders';

describe(`Update order`, () => {
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
    const status = OrderStatus.Cancelled;

    const response = await request(server.instance).patch(`${baseUrl}/${orderId}`).send({ status });

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('return forbidden when user does not own given order', async () => {
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

    const status = OrderStatus.Cancelled;

    const response = await request(server.instance)
      .patch(`${baseUrl}/${order.id}`)
      .set('Cookie', cookie)
      .send({ status });

    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
  });

  it('returns not found when invalid orderId is provided', async () => {
    const email = 'email@gmail.com';
    const id = 'asdasd';

    const cookie = signUp({ email, id });

    const orderId = '123';

    const status = OrderStatus.Cancelled;

    const response = await request(server.instance)
      .patch(`${baseUrl}/${orderId}`)
      .set('Cookie', cookie)
      .send({ status });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns not found when order with given id does not exist', async () => {
    const email = 'email@gmail.com';
    const id = 'asdasd';
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const cookie = signUp({ email, id });

    const status = OrderStatus.Cancelled;

    const response = await request(server.instance)
      .patch(`${baseUrl}/${orderId}`)
      .set('Cookie', cookie)
      .send({ status });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns bad request when invalid status is provided', async () => {
    const email = 'email@gmail.com';
    const userId = '1';

    const cookie = signUp({ email, id: userId });

    const title = 'title';
    const price = 50;

    const ticket = Ticket.build({ title, price });
    await ticket.save();

    const order = Order.build({ userId, status: OrderStatus.Created, expiresAt: new Date(), ticket });
    await order.save();

    const status = 'invalid';

    const response = await request(server.instance)
      .patch(`${baseUrl}/${order.id}`)
      .set('Cookie', cookie)
      .send({ status });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('updates and returns an order when order with given id exists and status is valid', async () => {
    const email = 'email@gmail.com';
    const userId = '1';

    const cookie = signUp({ email, id: userId });

    const title = 'title';
    const price = 50;

    const ticket = Ticket.build({ title, price });
    await ticket.save();

    const order = Order.build({ userId, status: OrderStatus.Created, expiresAt: new Date(), ticket });
    await order.save();

    const updatedStatus = OrderStatus.Cancelled;

    const response = await request(server.instance)
      .patch(`${baseUrl}/${order.id}`)
      .set('Cookie', cookie)
      .send({ status: updatedStatus });

    expect(response.statusCode).toBe(StatusCodes.OK);

    expect(response.body.userId).toBe(userId);
    expect(response.body.status).toBe(updatedStatus);

    // expect(natsClient.client.publish).toHaveBeenCalled();
  });
});
