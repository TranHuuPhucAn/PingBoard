'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import StatusBadge from '../../../components/StatusBadge';
import CheckHistoryTable from '../../../components/CheckHistoryTable';
import { api } from '../../../lib/api';
import type { Monitor, CheckResult } from '../../../types';

function calculateUptime(checks: CheckResult[]): string {
  if (checks.length === 0) return '—';
  const upCount = checks.filter(c => c.status === 'UP').length;
  return `${Math.round((upCount / checks.length) * 100)}%`;
}

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.monitors.get(id), api.monitors.checks(id)])
      .then(([mon, chk]) => {
        setMonitor(mon);
        setChecks(chk);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-5xl mx-auto px-6 py-10 text-gray-500 text-sm">Loading...</main>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-5xl mx-auto px-6 py-10 text-red-400 text-sm">{error ?? 'Monitor not found'}</main>
      </div>
    );
  }

  const status = monitor.latestStatus?.status ?? 'PENDING';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold">{monitor.name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-gray-500 text-sm">{monitor.url}</p>
          </div>
          <Link
            href={`/monitors/${id}/edit`}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Edit
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Uptime (last 50)', value: calculateUptime(checks) },
            { label: 'Response time', value: monitor.latestStatus ? `${monitor.latestStatus.responseTimeMs}ms` : '—' },
            { label: 'Interval', value: `Every ${monitor.intervalMinutes}m` },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className="text-white font-medium">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Check history */}
        <div>
          <h2 className="text-lg font-medium mb-4">Check history</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <CheckHistoryTable checks={checks} />
          </div>
        </div>
      </main>
    </div>
  );
}