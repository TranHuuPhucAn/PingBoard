import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../lib/validate';
import { addMonitorJob, removeMonitorJob } from '../lib/scheduler';
import { createMonitorSchema, updateMonitorSchema } from '../schemas/monitor.schema';

const router : Router= Router();

router.use(authMiddleware);

// Create a monitor
router.post('/', validateBody(createMonitorSchema), async (req: Request, res: Response) => {
  const { name, url, intervalMinutes } = req.body;

  const monitor = await prisma.monitor.create({
    data: {
      name,
      url,
      intervalMinutes,
      userId: req.user!.userId,
    },
  });

  await addMonitorJob(monitor.id, monitor.intervalMinutes);

  res.status(201).json(monitor);
});

// List authenticated user's monitors
router.get('/', async (req: Request, res: Response) => {
  const monitors = await prisma.monitor.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(monitors);
});

// Get a single monitor
router.get('/:id', async (req: Request, res: Response) => {
  const monitor = await prisma.monitor.findUnique({
    where: { id: req.params.id },
  });

  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
  if (monitor.userId !== req.user!.userId) return res.status(403).json({ error: 'Forbidden' });

  res.json(monitor);
});

// Get check history for a monitor
router.get('/:id/checks', async (req: Request, res: Response) => {
  const monitor = await prisma.monitor.findUnique({ where: { id: req.params.id } });
  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
  if (monitor.userId !== req.user!.userId) return res.status(403).json({ error: 'Forbidden' });

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const checks = await prisma.checkResult.findMany({
    where: { monitorId: req.params.id },
    orderBy: { checkedAt: 'desc' },
    take: limit,
  });

  res.json(checks);
});

// Update a monitor
router.put('/:id', validateBody(updateMonitorSchema), async (req: Request, res: Response) => {
  const monitor = await prisma.monitor.findUnique({ where: { id: req.params.id } });
  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
  if (monitor.userId !== req.user!.userId) return res.status(403).json({ error: 'Forbidden' });

  const updated = await prisma.monitor.update({
    where: { id: req.params.id },
    data: req.body,
  });

  if (req.body.intervalMinutes && req.body.intervalMinutes !== monitor.intervalMinutes) {
    await removeMonitorJob(req.params.id);
    await addMonitorJob(updated.id, updated.intervalMinutes);
  }
  res.json(updated);
});

// Delete a monitor
router.delete('/:id', async (req: Request, res: Response) => {
  const monitor = await prisma.monitor.findUnique({ where: { id: req.params.id } });
  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
  if (monitor.userId !== req.user!.userId) return res.status(403).json({ error: 'Forbidden' });

  await prisma.monitor.delete({ where: { id: req.params.id } });

  await removeMonitorJob(req.params.id);

  res.status(204).send();
});

export default router;