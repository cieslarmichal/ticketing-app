import request from 'supertest';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Order, Payment } from '../../models';
import mongoose from 'mongoose';
import { OrderStatus } from '@cieslar-ticketing-common/common';
import { stripeClient } from '../../shared';

const baseUrl = '/api/payments';

jest.setTimeout(60000);

describe(`Create payment integration`, () => {
  let server: Server;

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();
  });

  it('creates payment document and stripe payment', async () => {
    const email = 'email@gmail.com';
    const userId = '1';

    const cookie = signUp({ email, id: userId });

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const token = 'tok_visa';

    const price = Math.floor(Math.random() * 1000);

    const order = Order.build({
      id: orderId,
      userId,
      status: OrderStatus.Created,
      version: 0,
      price,
    });
    await order.save();

    await request(server.instance).post(baseUrl).set('Cookie', cookie).send({ token, orderId });

    const charges = await stripeClient.charges.list({ limit: 10 });

    const charge = charges.data.find((charge) => {
      return charge.amount === price * 100;
    });

    expect(charge).toBeDefined();
    expect(charge!.currency).toEqual('usd');

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: charge!.id,
    });

    expect(payment).not.toBeNull();
  });
});
