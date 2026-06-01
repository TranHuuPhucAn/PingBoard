export interface Monitor {
  id: string;
  name: string;
  url: string;
  intervalMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  latestStatus: {
    status: 'UP' | 'DOWN';
    statusCode: number | null;
    responseTimeMs: number | null;
    checkedAt: string;
  } | null;
}

export interface CheckResult {
  id: string;
  monitorId: string;
  status: 'UP' | 'DOWN' | 'PENDING';
  statusCode: number | null;
  responseTimeMs: number | null;
  checkedAt: string;
}

export interface Alert {
  id: string;
  monitorId: string;
  checkResultId: string;
  resolvedAt: string | null;
  createdAt: string;
  monitor: {
    name: string;
    url: string;
  };
}

export interface CreateMonitorInput {
  name: string;
  url: string;
  intervalMinutes: number;
}