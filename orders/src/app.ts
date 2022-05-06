import express from 'express';
require('express-async-errors');
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import { errorMiddleware, RouteNotFoundError } from '@cieslar-ticketing-common/common';
import { createOrderRouter, getOrderRouter, getOrdersRouter } from './routes';

export class App {
  public instance: express.Application;

  public constructor() {
    this.instance = express();
    this.setup();
  }

  private async setup() {
    this.instance.set('trust proxy', true);

    this.instance.use(express.json());
    this.instance.use(express.urlencoded({ extended: false }));
    this.instance.use(helmet());
    this.instance.use(
      cookieSession({
        name: 'session',
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
      }),
    );

    this.instance.use(createOrderRouter);
    this.instance.use(getOrdersRouter);
    this.instance.use(getOrderRouter);

    this.instance.all('*', () => {
      throw new RouteNotFoundError();
    });

    this.instance.use(errorMiddleware);
  }
}
