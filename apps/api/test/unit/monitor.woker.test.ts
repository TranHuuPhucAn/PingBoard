import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Job } from 'bullmq';

// Mock all external dependencies 
vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    monitor: { findUnique: vi.fn() },
    checkResult: { create: vi.fn(), findMany: vi.fn() },
    alert: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('../../src/lib/redis', () => ({
  redis: { set: vi.fn() },
  bullMQConnection: { host: 'localhost', port: 6379 },
}));

import { processMonitorCheck } from '../../src/workers/monitor.worker';
import { prisma } from '../../src/lib/prisma';

const mockMonitor = {
  id: 'monitor-1',
  name: 'Test',
  url: 'https://example.com',
  intervalMinutes: 5,
  isActive: true,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCheckResult = {
  id: 'check-1',
  monitorId: 'monitor-1',
  status: 'UP' as const,
  statusCode: 200,
  responseTimeMs: 120,
  checkedAt: new Date(),
};

function makeJob(monitorId: string) {
  return { data: { monitorId } } as Job<{ monitorId: string }>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.monitor.findUnique).mockResolvedValue(mockMonitor as any);
  vi.mocked(prisma.checkResult.create).mockResolvedValue(mockCheckResult as any);
  vi.mocked(prisma.checkResult.findMany).mockResolvedValue([]);
  vi.mocked(prisma.alert.findFirst).mockResolvedValue(null);
});

describe('processMonitorCheck', () => {
  it('saves an UP result when the URL returns 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true }));

    await processMonitorCheck(makeJob('monitor-1'));

    expect(prisma.checkResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'UP', statusCode: 200 }),
      })
    );
  });

  it('saves a DOWN result when the URL returns 503', async () => {
    vi.mocked(prisma.checkResult.create).mockResolvedValue({ ...mockCheckResult, status: 'DOWN' } as any);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false }));

    await processMonitorCheck(makeJob('monitor-1'));

    expect(prisma.checkResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DOWN', statusCode: 503 }),
      })
    );
  });

  it('saves a DOWN result when fetch throws (timeout, DNS failure, etc)', async () => {
    vi.mocked(prisma.checkResult.create).mockResolvedValue({ ...mockCheckResult, status: 'DOWN' } as any);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

    await processMonitorCheck(makeJob('monitor-1'));

    expect(prisma.checkResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DOWN' }),
      })
    );
  });

  it('creates an alert after 3 consecutive DOWN results', async () => {
    const downResult = { ...mockCheckResult, status: 'DOWN' as const };
    vi.mocked(prisma.checkResult.create).mockResolvedValue(downResult as any);
    vi.mocked(prisma.checkResult.findMany).mockResolvedValue([downResult, downResult, downResult] as any);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false }));

    await processMonitorCheck(makeJob('monitor-1'));

    expect(prisma.alert.create).toHaveBeenCalledOnce();
  });

  it('does not create a duplicate alert if one already exists', async () => {
    const downResult = { ...mockCheckResult, status: 'DOWN' as const };
    vi.mocked(prisma.checkResult.create).mockResolvedValue(downResult as any);
    vi.mocked(prisma.checkResult.findMany).mockResolvedValue([downResult, downResult, downResult] as any);
    vi.mocked(prisma.alert.findFirst).mockResolvedValue({ id: 'alert-1', resolvedAt: null } as any);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false }));

    await processMonitorCheck(makeJob('monitor-1'));

    expect(prisma.alert.create).not.toHaveBeenCalled();
  });

  it('skips processing if the monitor is inactive', async () => {
    vi.mocked(prisma.monitor.findUnique).mockResolvedValue({ ...mockMonitor, isActive: false } as any);

    await processMonitorCheck(makeJob('monitor-1'));

    expect(prisma.checkResult.create).not.toHaveBeenCalled();
  });
});