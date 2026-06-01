type Status = 'UP' | 'DOWN' | 'PENDING';

interface Props {
  status: Status;
}

const styles: Record<Status, string> = {
  UP: 'bg-green-500/10 text-green-400 ring-green-500/20',
  DOWN: 'bg-red-500/10 text-red-400 ring-red-500/20',
  PENDING: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
};

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'UP' ? 'bg-green-400' : status === 'DOWN' ? 'bg-red-400' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
}