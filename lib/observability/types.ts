/**
 * lib/observability/types.ts
 *
 * Domain types and contracts for the Superadmin Observability,
 * Traffic, Health and Performance Subsystem.
 */

export type SystemHealthStatus =
  | "HEALTHY"
  | "NORMAL"
  | "WARNING"
  | "DEGRADED"
  | "CRITICAL"
  | "UNKNOWN";

export type ServerRole =
  | "ALL_IN_ONE"
  | "APPLICATION"
  | "AUTH"
  | "WORKER"
  | "DATABASE"
  | "REDIS"
  | "MEDIA"
  | "SCHEDULER"
  | "LOAD_BALANCER"
  | "MONITORING";

export type ServerStatus =
  | "ONLINE"
  | "WARNING"
  | "DEGRADED"
  | "OFFLINE"
  | "DRAINING"
  | "MAINTENANCE";

export interface ServerResourceMetrics {
  serverId: string;
  name: string;
  hostname: string;
  role: ServerRole;
  status: ServerStatus;
  environment: string;
  region: string;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memoryTotalBytes: number;
  memoryUsedBytes: number;
  memoryUsagePercent: number;
  swapTotalBytes: number;
  swapUsedBytes: number;
  swapUsagePercent: number;
  diskTotalBytes: number;
  diskUsedBytes: number;
  diskUsagePercent: number;
  loadAvg1m: number;
  loadAvg5m: number;
  loadAvg15m: number;
  eventLoopLagMs: number;
  heapUsedBytes: number;
  heapTotalBytes: number;
  pm2ProcessCount: number;
  pm2Processes?: PM2ProcessSummary[];
  activeServices: string[];
  lastHeartbeatAt: string;
}

export interface PM2ProcessSummary {
  pm_id: number;
  name: string;
  status: string;
  restarts: number;
  cpuPercent: number;
  memoryBytes: number;
  uptimeSeconds: number;
}

export interface TrafficSummary {
  totalRequests: number;
  requestsPerMinute: number;
  requestsPerSecond: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRatePercent: number;
  slowRequestCount: number;
  topRoutes: { route: string; count: number; avgDurationMs: number }[];
  topTenants: { tenantId: string; count: number }[];
  topHostnames: { hostname: string; count: number }[];
  topStatusCodes: { statusCode: number; count: number }[];
  recentRequests: RequestTraceSummary[];
}

export interface RequestTraceSummary {
  requestId: string;
  timestamp: string;
  method: string;
  route: string;
  hostname: string;
  tenantId?: string;
  statusCode: number;
  durationMs: number;
  authDurationMs?: number;
  dbDurationMs?: number;
  externalDurationMs?: number;
  isSlow: boolean;
  isError: boolean;
  errorMessage?: string;
  userRole?: string;
  userAgentCategory?: string;
  serverId: string;
}

export interface QueueStatusSummary {
  name: string;
  displayName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  isHealthy: boolean;
  oldestWaitingSeconds?: number;
  workerCount: number;
}

export interface DatabaseHealthSummary {
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  pingLatencyMs: number;
  isPrimary: boolean;
  databaseName: string;
  totalCollections: number;
  collections?: { name: string; estimatedCount: number }[];
  lastSuccessfulBackup?: {
    id: string;
    createdAt: string;
    byteSize: number;
    status: string;
  } | null;
  lastFailedBackup?: {
    id: string;
    createdAt: string;
    error: string;
  } | null;
  activeConnections?: number;
  slowQueriesCount: number;
}

export interface RedisHealthSummary {
  status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
  pingLatencyMs: number;
  memoryUsedHuman: string;
  memoryUsedBytes: number;
  connectedClients: number;
  totalKeys: number;
  uptimeSeconds: number;
  role: string;
  hitRatePercent?: number;
}

export interface ExternalServiceCheckSummary {
  serviceName: string;
  displayName: string;
  category: "auth" | "payment" | "communication" | "ai" | "storage" | "cdn";
  isAvailable: boolean;
  latencyMs: number;
  statusCode?: number;
  errorMessage?: string;
  lastCheckedAt: string;
}

export interface ErrorGroupItem {
  id: string;
  fingerprint: string;
  title: string;
  message: string;
  errorType: string;
  status: "NEW" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED" | "IGNORED";
  severity: "INFO" | "WARNING" | "CRITICAL";
  stack?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  count: number;
  affectedRoutes: string[];
  affectedTenants: string[];
  sampleRequestIds: string[];
  lastServerId?: string;
}

export interface AlertRuleSummary {
  id: string;
  name: string;
  description?: string;
  metric: string;
  condition: "gt" | "gte" | "lt" | "lte" | "eq" | "missing";
  threshold: number;
  durationSeconds: number;
  severity: "INFO" | "WARNING" | "CRITICAL";
  enabled: boolean;
  cooldownMinutes: number;
  state: "OK" | "TRIGGERED" | "ACKNOWLEDGED" | "RESOLVED";
  lastTriggeredAt?: string;
  lastResolvedAt?: string;
  lastValue?: number;
}

export interface IncidentSummary {
  id: string;
  title: string;
  description: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";
  startedAt: string;
  resolvedAt?: string;
  affectedServices: string[];
  timeline: { time: string; message: string; author: string }[];
  notes?: string;
}

export interface OverviewDashboardData {
  systemStatus: SystemHealthStatus;
  statusReason: string;
  metrics: {
    availabilityPercent: number;
    requestsPerMinute: number;
    activeSessions: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    errorRatePercent: number;
    slowRequests1h: number;
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    swapUsagePercent: number;
    diskUsagePercent: number;
    databaseLatencyMs: number;
    redisLatencyMs: number;
    totalQueueWaiting: number;
    totalQueueFailed: number;
    paymentFailureRatePercent: number;
    activeAlertsCount: number;
    activeIncidentsCount: number;
  };
  server: ServerResourceMetrics;
  recentAlerts: AlertRuleSummary[];
  recentErrors: ErrorGroupItem[];
  recentIncidents: IncidentSummary[];
  queues: QueueStatusSummary[];
  dependencies: ExternalServiceCheckSummary[];
  lastBackup?: {
    id: string;
    createdAt: string;
    byteSize: number;
    status: string;
  } | null;
  generatedAt: string;
}
