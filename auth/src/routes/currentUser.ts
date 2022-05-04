import express from 'express';
import { currentUserMiddleware } from '@cieslar-ticketing-common/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUserMiddleware, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
