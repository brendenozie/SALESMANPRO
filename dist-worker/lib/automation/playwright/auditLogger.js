"use strict";
/**
 * lib/automation/playwright/auditLogger.ts
 *
 * Append-only structured audit logger for Playwright credential discovery,
 * onboarding, configuration changes, and health checks.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.AuditLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const secretRedaction_1 = require("./secretRedaction");
const AUDIT_DIR = path_1.default.resolve('storage', 'audit');
const AUDIT_FILE = path_1.default.join(AUDIT_DIR, 'credential-onboarding-audit.jsonl');
class AuditLogger {
    static instance;
    constructor() {
        this.ensureLogDir();
    }
    static getInstance() {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger();
        }
        return AuditLogger.instance;
    }
    ensureLogDir() {
        if (!fs_1.default.existsSync(AUDIT_DIR)) {
            fs_1.default.mkdirSync(AUDIT_DIR, { recursive: true });
        }
    }
    /**
     * Log an audit event. Content is guaranteed sanitized.
     */
    log(entry) {
        this.ensureLogDir();
        const fullEntry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            timestamp: new Date().toISOString(),
            actor: entry.actor,
            action: entry.action,
            providerId: entry.providerId,
            variableNames: entry.variableNames,
            status: entry.status,
            details: (0, secretRedaction_1.sanitizeData)(entry.details || {}),
        };
        const line = JSON.stringify(fullEntry) + '\n';
        fs_1.default.appendFileSync(AUDIT_FILE, line, 'utf8');
        return fullEntry;
    }
    /**
     * Retrieve recent audit records (for Super Admin dashboard or test reports).
     */
    getRecentLogs(limit = 50) {
        if (!fs_1.default.existsSync(AUDIT_FILE)) {
            return [];
        }
        try {
            const content = fs_1.default.readFileSync(AUDIT_FILE, 'utf8');
            const lines = content
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean);
            const entries = [];
            for (const line of lines.slice(-limit)) {
                try {
                    entries.push(JSON.parse(line));
                }
                catch {
                    // Ignore malformed line
                }
            }
            return entries.reverse();
        }
        catch {
            return [];
        }
    }
}
exports.AuditLogger = AuditLogger;
exports.auditLogger = AuditLogger.getInstance();
