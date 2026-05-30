import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router : Router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const alerts = await prisma.alert.findMany({
    where: {
      resolvedAt: null,
      monitor: { userId: req.user!.userId },
    },
    include: {
      monitor: { select: { name: true, url: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(alerts);
});

export default router;