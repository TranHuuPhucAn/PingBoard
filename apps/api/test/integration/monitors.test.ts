import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { signTestToken } from '../helpers';

// Mock the scheduler so tests don't try to connect to BullMQ/Redis
vi.mock('../../src/lib/scheduler', () => ({
  addMonitorJob: vi.fn().mockResolvedValue(undefined),
  removeMonitorJob: vi.fn().mockResolvedValue(undefined),
}));

async function createTestUser(id: string) {
  return prisma.user.create({
    data: { id, githubId: `github-${id}`, name: 'Test User' },
  });
}

beforeEach(async () => {
  // Clear tables in the right order to respect foreign key constraints
  await prisma.alert.deleteMany();
  await prisma.checkResult.deleteMany();
  await prisma.monitor.deleteMany();
  await prisma.user.deleteMany();
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Monitors — unauthenticated', () => {
  it('returns 401 on GET /monitors without a token', async () => {
    const res = await request(app).get('/monitors');
    expect(res.status).toBe(401);
  });

  it('returns 401 on POST /monitors without a token', async () => {
    const res = await request(app).post('/monitors').send({ name: 'Test', url: 'https://example.com' });
    expect(res.status).toBe(401);
  });
});

describe('Monitors — CRUD', () => {
  it('POST /monitors creates a monitor and returns 201', async () => {
    const user = await createTestUser('user-1');
    const token = signTestToken(user.id);

    const res = await request(app)
      .post('/monitors')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My API', url: 'https://example.com', intervalMinutes: 5 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My API');
    expect(res.body.url).toBe('https://example.com');
    expect(res.body.userId).toBe(user.id);
  });

  it('POST /monitors returns 400 for an invalid URL', async () => {
    const user = await createTestUser('user-1');
    const token = signTestToken(user.id);

    const res = await request(app)
      .post('/monitors')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My API', url: 'not-a-url', intervalMinutes: 5 });

    expect(res.status).toBe(400);
  });

  it('GET /monitors returns only the authenticated user\'s monitors', async () => {
    const userA = await createTestUser('user-a');
    const userB = await createTestUser('user-b');

    await prisma.monitor.createMany({
      data: [
        { name: 'A1', url: 'https://a1.com', userId: userA.id },
        { name: 'A2', url: 'https://a2.com', userId: userA.id },
        { name: 'B1', url: 'https://b1.com', userId: userB.id },
      ],
    });

    const res = await request(app)
      .get('/monitors')
      .set('Authorization', `Bearer ${signTestToken(userA.id)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((m: { userId: string }) => m.userId === userA.id)).toBe(true);
  });

  it('GET /monitors/:id returns 403 for another user\'s monitor', async () => {
    const userA = await createTestUser('user-a');
    const userB = await createTestUser('user-b');

    const monitor = await prisma.monitor.create({
      data: { name: 'B monitor', url: 'https://b.com', userId: userB.id },
    });

    const res = await request(app)
      .get(`/monitors/${monitor.id}`)
      .set('Authorization', `Bearer ${signTestToken(userA.id)}`);

    expect(res.status).toBe(403);
  });

  it('PUT /monitors/:id updates the monitor', async () => {
    const user = await createTestUser('user-1');
    const monitor = await prisma.monitor.create({
      data: { name: 'Old name', url: 'https://example.com', userId: user.id },
    });

    const res = await request(app)
      .put(`/monitors/${monitor.id}`)
      .set('Authorization', `Bearer ${signTestToken(user.id)}`)
      .send({ name: 'New name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New name');
  });

  it('DELETE /monitors/:id returns 204 and removes the monitor', async () => {
    const user = await createTestUser('user-1');
    const monitor = await prisma.monitor.create({
      data: { name: 'To delete', url: 'https://example.com', userId: user.id },
    });

    const deleteRes = await request(app)
      .delete(`/monitors/${monitor.id}`)
      .set('Authorization', `Bearer ${signTestToken(user.id)}`);

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/monitors/${monitor.id}`)
      .set('Authorization', `Bearer ${signTestToken(user.id)}`);

    expect(getRes.status).toBe(404);
  });
});