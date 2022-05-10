export const stripeClient = {
  charges: {
    create: jest.fn().mockImplementation(() => {
      return { id: '123' };
    }),
  },
};
