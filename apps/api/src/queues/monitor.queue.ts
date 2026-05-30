import { Queue } from 'bullmq';
import { bullMQConnection } from '../lib/redis';

export const monitorQueue = new Queue('monitor-checks', {
  connection: bullMQConnection,
});