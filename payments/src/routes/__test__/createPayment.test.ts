import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Order } from '../../models';
import mongoose from 'mongoose';
import { OrderStatus } from '@cieslar-ticketing-common/common';
import { stripe } from '../../shared';

const baseUrl = '/api/payments';

describe(`Create payment`, () => {
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
    const token = '123';

    const response = await request(server.instance).post(baseUrl).send({ orderId, token });

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns bad request when token is not provided', async () => {
    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const orderId = new mongoose.Types.ObjectId().toHexString();

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ orderId });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns bad request when orderId is not provided', async () => {
    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const token = '123';

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ token });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns not found when provided orderId is not uuid', async () => {
    const orderId = 'abc';
    const token = '123';

    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ token, orderId });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns not found when order with corresponding orderId does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const token = '123';

    const email = 'email@gmail.com';
    const id = '1';

    const cookie = signUp({ email, id });

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ token, orderId });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('returns forbidden when user requesting payment creation does not own the order', async () => {
    const email = 'email@gmail.com';
    const userId = '1';
    const otherUserId = '2';

    const cookie = signUp({ email, id: otherUserId });

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const token = '123';

    const order = Order.build({
      id: orderId,
      userId,
      status: OrderStatus.Created,
      version: 0,
      price: 5,
    });
    await order.save();

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ token, orderId });

    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
  });

  it('returns unprocessable entity when trying to pay for cancelled order', async () => {
    const email = 'email@gmail.com';
    const userId = '1';

    const cookie = signUp({ email, id: userId });

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const token = '123';

    const order = Order.build({
      id: orderId,
      userId,
      status: OrderStatus.Cancelled,
      version: 0,
      price: 5,
    });
    await order.save();

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ token, orderId });

    expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('creates an order when valid inputs are provided', async () => {
    let orders = await Order.find({});
    expect(orders.length).toEqual(0);

    const email = 'email@gmail.com';
    const userId = '1';

    const cookie = signUp({ email, id: userId });

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const token = '123';

    const order = Order.build({
      id: orderId,
      userId,
      status: OrderStatus.Created,
      version: 0,
      price: 5,
    });
    await order.save();

    const response = await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ token, orderId });

    expect(response.statusCode).toBe(StatusCodes.CREATED);

    orders = await Order.find({});
    expect(orders.length).toEqual(1);

    expect(orders[0].userId).toBe(userId);
    expect(orders[0]._id.toString()).toBe(orderId);

    expect(response.body.userId).toBe(userId);
    expect(response.body.id).toBe(orderId);

    const stripeChargesCreateMock = stripe.charges.create as jest.Mock;

    const actualChargeData = stripeChargesCreateMock.mock.calls[0][0];

    expect(actualChargeData.currency).toEqual('usd');
    expect(actualChargeData.amount).toEqual(order.price * 1000);
    expect(actualChargeData.source).toEqual(token);
  });
});
