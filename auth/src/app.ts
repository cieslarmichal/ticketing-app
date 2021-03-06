import express from 'express';
require('express-async-errors');
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import { currentUserRouter, signInRouter, signOutRouter, signUpRouter } from './routes';
import { errorMiddleware, RouteNotFoundError } from '@cieslar-ticketing-common/common';

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
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
        name: 'session',
      }),
    );

    this.instance.use(signUpRouter);
    this.instance.use(signInRouter);
    this.instance.use(signOutRouter);
    this.instance.use(currentUserRouter);

    this.instance.all('*', () => {
      throw new RouteNotFoundError();
    });

    this.instance.use(errorMiddleware);
  }
}
