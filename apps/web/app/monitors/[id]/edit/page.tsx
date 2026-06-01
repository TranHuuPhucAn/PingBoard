'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { api } from '../../../../lib/api';
import type { Monitor } from '../../../../types';

export default function EditMonitorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.monitors.get(id).then(setMonitor).catch(err => setError(err.message));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    try {
      await api.monitors.update(id, {
        name: form.get('name') as string,
        url: form.get('url') as string,
        intervalMinutes: Number(form.get('intervalMinutes')),
      });
      router.push(`/monitors/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${monitor?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.monitors.delete(id);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setDeleting(false);
    }
  }

  if (!monitor) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-xl mx-auto px-6 py-10 text-gray-500 text-sm">
          {error ?? 'Loading...'}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-8">Edit monitor</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={monitor.name}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">URL</label>
            <input
              name="url"
              type="url"
              required
              defaultValue={monitor.url}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Check interval</label>
            <select
              name="intervalMinutes"
              defaultValue={monitor.intervalMinutes}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gray-500"
            >
              <option value="1">Every 1 minute</option>
              <option value="5">Every 5 minutes</option>
              <option value="10">Every 10 minutes</option>
              <option value="30">Every 30 minutes</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white px-5 py-2.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Danger zone */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Danger zone</h2>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete this monitor'}
          </button>
        </div>
      </main>
    </div>
  );
}