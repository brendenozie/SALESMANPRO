/**
 * lib/automation/playwright/auditLogger.ts
 *
 * Append-only structured audit logger for Playwright credential discovery,
 * onboarding, configuration changes, and health checks.
 */

import fs from 'fs';
import path from 'path';
import { AuditLogEntry } from './types';
import { sanitizeData } from './secretRedaction';

const AUDIT_DIR = path.resolve('storage', 'audit');
const AUDIT_FILE = path.join(AUDIT_DIR, 'credential-onboarding-audit.jsonl');

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {
    this.ensureLogDir();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(AUDIT_DIR)) {
      fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
  }

  /**
   * Log an audit event. Content is guaranteed sanitized.
   */
  public log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    this.ensureLogDir();

    const fullEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      actor: entry.actor,
      action: entry.action,
      providerId: entry.providerId,
      variableNames: entry.variableNames,
      status: entry.status,
      details: sanitizeData(entry.details || {}),
    };

    const line = JSON.stringify(fullEntry) + '\n';
    fs.appendFileSync(AUDIT_FILE, line, 'utf8');

    return fullEntry;
  }

  /**
   * Retrieve recent audit records (for Super Admin dashboard or test reports).
   */
  public getRecentLogs(limit = 50): AuditLogEntry[] {
    if (!fs.existsSync(AUDIT_FILE)) {
      return [];
    }

    try {
      const content = fs.readFileSync(AUDIT_FILE, 'utf8');
      const lines = content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const entries: AuditLogEntry[] = [];
      for (const line of lines.slice(-limit)) {
        try {
          entries.push(JSON.parse(line));
        } catch {
          // Ignore malformed line
        }
      }
      return entries.reverse();
    } catch {
      return [];
    }
  }
}

export const auditLogger = AuditLogger.getInstance();
