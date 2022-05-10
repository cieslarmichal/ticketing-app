import Stripe from 'stripe';

export const stripeClient = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2020-08-27',
});
