/**
 * lib/ai/mascot/taskTypes.ts
 *
 * Comprehensive TypeScript definitions for SalesmanPro Mascot Background AI Tasks,
 * Autonomous Task Lifecycle, Subtask Orchestration, Monitoring & Auditability.
 */

export type MascotTaskState =
  | "PENDING"
  | "VALIDATING"
  | "AWAITING_APPROVAL"
  | "QUEUED"
  | "RUNNING"
  | "PAUSED"
  | "RETRYING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type MascotTaskPriority = 1 | 2 | 3 | 4; // 1 = Low, 2 = Normal, 3 = High, 4 = Urgent

export type MascotTaskType =
  | "REPORT_GENERATION"
  | "BULK_PRICE_UPDATE"
  | "MARKETPLACE_SYNC"
  | "MARKETING_CAMPAIGN"
  | "STUDENT_ASSESSMENT"
  | "DEAD_STOCK_AUDIT"
  | "DATA_ANALYSIS"
  | "DOCUMENT_PREPARATION"
  | "CATALOG_IMPORT";

export type MascotErrorCategory =
  | "TRANSIENT_NETWORK"
  | "RATE_LIMIT"
  | "PERMISSION_DENIED"
  | "CREDIT_EXHAUSTED"
  | "VALIDATION_FAILED"
  | "FATAL";

export interface MascotSubtask {
  id: string;
  title: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
  dependsOn?: string[]; // IDs of predecessor subtasks
  progress?: number;
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MascotTaskCheckpoint {
  timestamp: string;
  step: string;
  message: string;
  processedCount?: number;
  totalCount?: number;
  verified?: boolean;
}

export interface MascotTaskProgress {
  percent: number;
  currentStep: string;
  processedCount: number;
  totalCount: number;
  estimatedRemainingSeconds?: number | null;
  lastHeartbeatAt: string;
  checkpoints: MascotTaskCheckpoint[];
}

export interface MascotTaskApprovalData {
  approvalId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  actionType: string;
  title: string;
  description: string;
  proposedAction: Record<string, any>;
  affectedRecords?: string[] | number;
  estimatedCostKES?: number;
  creditsRequired: number;
  risks: string[];
  requestedBy: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  expiresAt?: string | null;
}

export interface MascotTaskAuditEntry {
  timestamp: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  details?: Record<string, any>;
}

export interface MascotTaskError {
  code: string;
  message: string;
  category: MascotErrorCategory;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
}

export interface MascotTaskCredits {
  reserved: number;
  consumed: number;
  reservationId?: string;
}

export interface MascotTaskRecord {
  id: string;
  companyId: string;
  storeSlug?: string;
  userId: string;
  userRole: string;
  requiredPermissions: string[];
  taskType: MascotTaskType;
  title: string;
  description?: string;
  status: MascotTaskState;
  priority: MascotTaskPriority;
  requiresApproval: boolean;
  approval?: MascotTaskApprovalData;
  progress: MascotTaskProgress;
  subtasks: MascotSubtask[];
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: MascotTaskError;
  credits: MascotTaskCredits;
  auditTrail: MascotTaskAuditEntry[];
  deepLinks: Array<{ label: string; href: string; icon?: string }>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface MascotTaskFilter {
  status?: MascotTaskState | MascotTaskState[];
  taskType?: MascotTaskType;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
