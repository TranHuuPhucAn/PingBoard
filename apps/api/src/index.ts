import app from './app';
import { prisma } from './lib/prisma';
import { addMonitorJob } from './lib/scheduler';
import './workers/monitor.worker';

const PORT = process.env.PORT ?? '3001';

async function rehydrateJobs() {
  const activeMonitors = await prisma.monitor.findMany({
    where: { isActive: true },
  });

  for (const monitor of activeMonitors) {
    await addMonitorJob(monitor.id, monitor.intervalMinutes);
  }

  console.log(`Rehydrated ${activeMonitors.length} monitor job(s)`);
}

app.listen(Number(PORT), async () => {
  console.log(`API running on http://localhost:${PORT}`);
  await rehydrateJobs();
});