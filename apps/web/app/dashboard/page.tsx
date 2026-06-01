'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import MonitorCard from '../../components/MonitorCard';
import { api } from '../../lib/api';
import type { Monitor } from '../../types';

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.monitors.list()
      .then(setMonitors)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Monitors</h1>
          <Link
            href="/monitors/new"
            className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            + New monitor
          </Link>
        </div>

        {loading && (
          <div className="text-gray-500 text-sm">Loading monitors...</div>
        )}

        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && monitors.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No monitors yet</p>
            <p className="text-sm mb-6">Add your first URL to start monitoring it.</p>
            <Link
              href="/monitors/new"
              className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Add your first monitor
            </Link>
          </div>
        )}

        {!loading && monitors.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {monitors.map(monitor => (
              <MonitorCard key={monitor.id} monitor={monitor} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}