import Link from 'next/link';
import StatusBadge from './StatusBadge';
import type { Monitor } from '../types';

interface Props {
  monitor: Monitor;
}

function calculateUptime(monitor: Monitor): string {
  if (!monitor.latestStatus) return '—';
  return monitor.latestStatus.status === 'UP' ? '100%' : '0%';
}

export default function MonitorCard({ monitor }: Props) {
  const status = monitor.latestStatus?.status ?? 'PENDING';

  return (
    <Link
      href={`/monitors/${monitor.id}`}
      className="block bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white truncate">{monitor.name}</p>
          <p className="text-sm text-gray-500 truncate mt-0.5">{monitor.url}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
        <span>Every {monitor.intervalMinutes}m</span>
        {monitor.latestStatus && (
          <>
            <span>{monitor.latestStatus.responseTimeMs}ms</span>
            <span>Uptime {calculateUptime(monitor)}</span>
          </>
        )}
      </div>
    </Link>
  );
}