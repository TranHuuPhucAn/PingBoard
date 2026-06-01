import StatusBadge from './StatusBadge';
import type { CheckResult } from '../types';

interface Props {
  checks: CheckResult[];
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export default function CheckHistoryTable({ checks }: Props) {
  if (checks.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No checks yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-left">
            <th className="pb-3 text-gray-400 font-medium">Time</th>
            <th className="pb-3 text-gray-400 font-medium">Status</th>
            <th className="pb-3 text-gray-400 font-medium">HTTP Code</th>
            <th className="pb-3 text-gray-400 font-medium">Response Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {checks.map((check) => (
            <tr key={check.id}>
              <td className="py-3 text-gray-400">{formatTime(check.checkedAt)}</td>
              <td className="py-3">
                <StatusBadge status={check.status} />
              </td>
              <td className="py-3 text-gray-400">{check.statusCode ?? '—'}</td>
              <td className="py-3 text-gray-400">
                {check.responseTimeMs != null ? `${check.responseTimeMs}ms` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}