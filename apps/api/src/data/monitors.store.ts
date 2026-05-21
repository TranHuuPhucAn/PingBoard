export interface Monitor {
  id: string;
  name: string;
  url: string;
  intervalMinutes: number;
  isActive: boolean;
  createdAt: string;
}

const store = new Map<string, Monitor>();
let counter = 1;

export const monitorsStore = {
  create(data: Omit<Monitor, 'id' | 'createdAt'>): Monitor {
    const monitor: Monitor = {
      id: String(counter++),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.set(monitor.id, monitor);
    return monitor;
  },

  findAll(): Monitor[] {
    return Array.from(store.values());
  },

  findById(id: string): Monitor | undefined {
    return store.get(id);
  },

  update(id: string, data: Partial<Omit<Monitor, 'id' | 'createdAt'>>): Monitor | undefined {
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    store.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return store.delete(id);
  },
};