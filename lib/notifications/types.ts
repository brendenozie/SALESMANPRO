/**
 * lib/notifications/types.ts
 *
 * Strongly-typed event contracts, recipient policies, channels, and payloads
 * for the SalesmanPro Unified Notification System.
 */

export type NotificationEventType =
  // Orders & POS
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "ORDER_CANCELLED"
  | "ORDER_FULFILLED"
  // Payments
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  // Inventory
  | "LOW_STOCK_WARNING"
  | "STOCKOUT_WARNING"
  | "INVENTORY_DISCREPANCY"
  // AI Mascot & Background Tasks
  | "MASCOT_TASK_QUEUED"
  | "MASCOT_APPROVAL_REQUESTED"
  | "MASCOT_TASK_PAUSED"
  | "MASCOT_TASK_COMPLETED"
  | "MASCOT_TASK_PARTIALLY_COMPLETED"
  | "MASCOT_TASK_FAILED"
  | "MASCOT_TASK_CANCELLED"
  | "MASCOT_INTERVENTION_NEEDED"
  // Staff & Access
  | "STAFF_INVITED"
  | "STAFF_ACCESS_REVOKED"
  | "STAFF_ROLE_CHANGED"
  // Observability & Platform Incidents
  | "OBSERVABILITY_ALERT"
  | "SECURITY_ALERT"
  | "SYSTEM_OUTAGE"
  // General / Announcements
  | "STORE_ANNOUNCEMENT"
  | "PLATFORM_ANNOUNCEMENT";

export type NotificationSeverity = "INFO" | "WARNING" | "CRITICAL";

export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH_ANDROID" | "PUSH_DESKTOP";

export type RecipientPolicyType =
  | "SPECIFIC_USERS"
  | "STORE_ADMINS"
  | "COMPANY_ADMINS"
  | "SUPER_ADMINS"
  | "STORE_ROLE"
  | "DEPARTMENT"
  | "STORE_STAFF";

export interface RecipientPolicy {
  type: RecipientPolicyType;
  /** When type is SPECIFIC_USERS, list of user ObjectIDs */
  userIds?: string[];
  /** When type is STORE_ROLE, e.g., 'CASHIER', 'MANAGER' */
  role?: string;
  /** When type is DEPARTMENT, e.g., 'Finance', 'Administration' */
  department?: string;
  /** Explicit user IDs to exclude from receiving this notification */
  excludeUserIds?: string[];
}

export interface NotificationEventContract {
  eventType: NotificationEventType;
  severity: NotificationSeverity;
  companyId?: string | null;
  storeId?: string | null;
  title: string;
  message: string;
  actionUrl?: string;
  resourceType?: "order" | "mascot_task" | "inventory" | "alert" | "user" | "payment" | "staff";
  resourceId?: string;
  actorId?: string;
  actorRole?: string;
  recipientPolicy: RecipientPolicy;
  channels?: NotificationChannel[];
  idempotencyKey?: string;
  metadata?: Record<string, any>;
  occurredAt?: string | Date;
}

export interface NotificationRecordDto {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  eventType: string | null;
  actionUrl: string | null;
  resourceType: string | null;
  resourceId: string | null;
  companyId: string | null;
  storeId: string | null;
  createdAt: string;
  read: boolean;
  readAt: string | null;
  acknowledgedAt: string | null;
  dismissedAt: string | null;
}

export interface NotificationFilterOptions {
  userId: string;
  companyId?: string;
  storeId?: string;
  unreadOnly?: boolean;
  severity?: NotificationSeverity;
  eventType?: string;
  limit?: number;
  offset?: number;
}
