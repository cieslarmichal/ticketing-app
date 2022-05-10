export const stripeClient = {
  charges: {
    create: jest.fn().mockResolvedValue({}),
  },
};
