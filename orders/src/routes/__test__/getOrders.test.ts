import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Server } from '../../server';
import { App } from '../../app';
import { signUp } from '../../test';
import { Order, Ticket } from '../../models';
import { OrderStatus } from '@cieslar-ticketing-common/common';

const baseUrl = '/api/orders';

describe(`Get orders`, () => {
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
    const response = await request(server.instance).get(baseUrl).send();

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns orders owned by user sending request', async () => {
    const email = 'email@gmail.com';
    const userId = '1';
    const otherUserId = '2';

    const cookie = signUp({ email, id: userId });

    const title1 = 'title1';
    const price1 = 50;

    const ticket1 = Ticket.build({ title: title1, price: price1 });
    await ticket1.save();

    const title2 = 'title2';
    const price2 = 60;

    const ticket2 = Ticket.build({ title: title2, price: price2 });
    await ticket2.save();

    const title3 = 'title3';
    const price3 = 70;

    const ticket3 = Ticket.build({ title: title3, price: price3 });
    await ticket3.save();

    const order1 = Order.build({ userId, status: OrderStatus.Created, expiresAt: new Date(), ticket: ticket1 });
    await order1.save();

    const order2 = Order.build({ userId, status: OrderStatus.Created, expiresAt: new Date(), ticket: ticket2 });
    await order2.save();

    const otherOrder = Order.build({
      userId: otherUserId,
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket: ticket3,
    });
    await otherOrder.save();

    const response = await request(server.instance).get(baseUrl).set('Cookie', cookie).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    expect(response.body.length).toBe(2);
    expect(response.body[0].userId).toBe(userId);
    expect(response.body[0].ticket.id).toBe(ticket1.id);
    expect(response.body[1].userId).toBe(userId);
    expect(response.body[1].ticket.id).toBe(ticket2.id);
  });
});
