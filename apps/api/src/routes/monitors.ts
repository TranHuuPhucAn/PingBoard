import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router : Router = Router();

// Create a monitor
const TEMP_USER_ID = 'temp-user';

router.post('/', async (req: Request, res: Response) => {
  const { name, url, intervalMinutes = 5 } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'name and url are required' });
  }

  const monitor = await prisma.monitor.create({
    data: { name, url, intervalMinutes, userId: TEMP_USER_ID },
  });

  res.status(201).json(monitor);
});

// List all monitors
router.get('/', async (_req: Request, res: Response) => {
  const monitors = await prisma.monitor.findMany({
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
  res.json(monitor);
});

// Update a monitor
router.put('/:id', async (req: Request, res: Response) => {
  const { name, url, intervalMinutes, isActive } = req.body;

  const monitor = await prisma.monitor.findUnique({
    where: { id: req.params.id },
  });
  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

  const updated = await prisma.monitor.update({
    where: { id: req.params.id },
    data: { name, url, intervalMinutes, isActive },
  });
  res.json(updated);
});

// Delete a monitor
router.delete('/:id', async (req: Request, res: Response) => {
  const monitor = await prisma.monitor.findUnique({
    where: { id: req.params.id },
  });
  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

  await prisma.monitor.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;