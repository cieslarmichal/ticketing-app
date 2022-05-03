import request from 'supertest';
import http from 'http';
const singUpUrl = '/api/users/signup';

export const signUp = async (credentials: { email: string; password: string }, server: http.Server) => {
  const response = await request(server).post(singUpUrl).send(credentials);

  const cookie = response.get('Set-Cookie');

  return cookie;
};
