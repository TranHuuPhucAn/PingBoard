import { Router, Request, Response } from 'express';
import { monitorsStore } from '../data/monitors.store';

const router: Router = Router();

// Create a monitor
router.post('/', (req: Request, res: Response) => {
  const { name, url, intervalMinutes = 5 } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'name and url are required' });
  }

  const monitor = monitorsStore.create({
    name,
    url,
    intervalMinutes,
    isActive: true,
  });

  res.status(201).json(monitor);
});

// List all monitors
router.get('/', (_req: Request, res: Response) => {
  res.json(monitorsStore.findAll());
});

// Get a single monitor
router.get('/:id', (req: Request, res: Response) => {
  const monitor = monitorsStore.findById(req.params.id);
  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
  res.json(monitor);
});

// Update a monitor
router.put('/:id', (req: Request, res: Response) => {
  const updated = monitorsStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Monitor not found' });
  res.json(updated);
});

// Delete a monitor
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = monitorsStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Monitor not found' });
  res.status(204).send();
});

export default router;