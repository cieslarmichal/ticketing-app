import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  if (!req.session?.token) {
    res.send({ currentUser: null });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET as string;

  try {
    const tokenPayload = jwt.verify(req.session.token, jwtSecret);
    res.send({ currentUser: tokenPayload });
  } catch (error) {
    res.send({ currentUser: null });
    return;
  }
});

export { router as currentUserRouter };
