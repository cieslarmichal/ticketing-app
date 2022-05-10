import jwt from 'jsonwebtoken';

export const signUp = (authPayload: { email: string; id: string }) => {
  const jwtSecret = process.env.JWT_SECRET as string;

  const token = jwt.sign(authPayload, jwtSecret);

  const session = { token };

  const sessionJSON = JSON.stringify(session);

  const sessionBase64 = Buffer.from(sessionJSON).toString('base64');

  const cookie = `session=${sessionBase64}`;

  return [cookie];
};
