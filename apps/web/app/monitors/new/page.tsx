'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { api } from '../../../lib/api';

export default function NewMonitorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    try {
      await api.monitors.create({
        name: form.get('name') as string,
        url: form.get('url') as string,
        intervalMinutes: Number(form.get('intervalMinutes')),
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-8">New monitor</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="My API"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">URL</label>
            <input
              name="url"
              type="url"
              required
              placeholder="https://api.example.com/health"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Check interval</label>
            <select
              name="intervalMinutes"
              defaultValue="5"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gray-500"
            >
              <option value="1">Every 1 minute</option>
              <option value="5">Every 5 minutes</option>
              <option value="10">Every 10 minutes</option>
              <option value="30">Every 30 minutes</option>
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create monitor'}
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
      </main>
    </div>
  );
}