import { Worker, Job } from 'bullmq';
import { redis, bullMQConnection } from '../lib/redis';
import { prisma } from '../lib/prisma';

interface MonitorJobData {
  monitorId: string;
}

export async function processMonitorCheck(job: Job<MonitorJobData>) {
  const { monitorId } = job.data;

  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
  if (!monitor || !monitor.isActive) return;

  // Ping the URL and measure response time
  const startTime = Date.now();
  let status: 'UP' | 'DOWN' = 'DOWN';
  let statusCode: number | null = null;

  try {
    const response = await fetch(monitor.url, {
      signal: AbortSignal.timeout(10000),
    });
    statusCode = response.status;
    status = response.ok ? 'UP' : 'DOWN';
  } catch {
    // Timeout, DNS failure, connection refused — all count as DOWN
    status = 'DOWN';
  }

  const responseTimeMs = Date.now() - startTime;

  // Save the result to the database
  const checkResult = await prisma.checkResult.create({
    data: { monitorId, status, statusCode, responseTimeMs },
  });

  // Cache the latest result in Redis (5 minute TTL)
  await redis.set(
    `monitor:${monitorId}:latest`,
    JSON.stringify({
      status,
      statusCode,
      responseTimeMs,
      checkedAt: checkResult.checkedAt,
    }),
    'EX',
    300
  );

  // Alert logic: if the last 3 checks are all DOWN, create an alert
  if (status === 'DOWN') {
    const recent = await prisma.checkResult.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
      take: 3,
    });

    const allDown = recent.length === 3 && recent.every(r => r.status === 'DOWN');

    if (allDown) {
      const existing = await prisma.alert.findFirst({
        where: { monitorId, resolvedAt: null },
      });

      if (!existing) {
        await prisma.alert.create({
          data: { monitorId, checkResultId: checkResult.id },
        });
        console.log(`Alert created for monitor ${monitorId}`);
      }
    }
  }
}

export const monitorWorker = new Worker<MonitorJobData>(
  'monitor-checks',
  processMonitorCheck,
  { connection: bullMQConnection }
);

monitorWorker.on('completed', (job) => {
  console.log(`Check completed — monitor: ${job.data.monitorId} `);
});

monitorWorker.on('failed', (job, err) => {
  console.error(`Check failed — monitor: ${job?.data.monitorId}: ${err.message}`);
});