import { monitorQueue } from '../queues/monitor.queue';

export async function addMonitorJob(monitorId: string, intervalMinutes: number) {
  await monitorQueue.add(
    'check',
    { monitorId },
    {
      repeat: { every: intervalMinutes * 60 * 1000 },
      jobId: `monitor:${monitorId}`,
    }
  );
}

export async function removeMonitorJob(monitorId: string) {
  const repeatableJobs = await monitorQueue.getRepeatableJobs();
  const job = repeatableJobs.find(j => j.id === `monitor:${monitorId}`);
  if (job) {
    await monitorQueue.removeJobScheduler(job.key);
  }
}