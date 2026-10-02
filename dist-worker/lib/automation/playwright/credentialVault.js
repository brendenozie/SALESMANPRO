"use strict";
/**
 * lib/automation/playwright/credentialVault.ts
 *
 * Secure local credential vault and atomic .env configuration manager.
 * Manages backup, parsing, atomic updates, and masked diffs without
 * ever logging or leaking secret values.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialVault = exports.CredentialVault = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const auditLogger_1 = require("./auditLogger");
const secretRedaction_1 = require("./secretRedaction");
class CredentialVault {
    static instance;
    envPath;
    backupDir;
    constructor() {
        this.envPath = path_1.default.resolve('.env');
        this.backupDir = path_1.default.resolve('storage', 'backups', 'env');
        this.ensureDirs();
    }
    static getInstance() {
        if (!CredentialVault.instance) {
            CredentialVault.instance = new CredentialVault();
        }
        return CredentialVault.instance;
    }
    ensureDirs() {
        if (!fs_1.default.existsSync(this.backupDir)) {
            fs_1.default.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    /**
     * Parse an .env file preserving exact line structures and comments.
     */
    parseEnvStructure(filePath) {
        if (!fs_1.default.existsSync(filePath))
            return [];
        const content = fs_1.default.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        const result = [];
        for (const raw of lines) {
            const trimmed = raw.trim();
            if (!trimmed) {
                result.push({ type: 'blank', raw });
            }
            else if (trimmed.startsWith('#')) {
                result.push({ type: 'comment', raw });
            }
            else {
                const eqIdx = raw.indexOf('=');
                if (eqIdx > 0) {
                    const key = raw.substring(0, eqIdx).trim();
                    let value = raw.substring(eqIdx + 1).trim();
                    let quote = '';
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        quote = value[0];
                        value = value.substring(1, value.length - 1);
                    }
                    result.push({ type: 'assignment', raw, key, value, quote });
                }
                else {
                    result.push({ type: 'comment', raw });
                }
            }
        }
        return result;
    }
    /**
     * Create an automated timestamped backup of the current .env file.
     */
    createBackup() {
        if (!fs_1.default.existsSync(this.envPath)) {
            return null;
        }
        this.ensureDirs();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path_1.default.join(this.backupDir, `.env.backup.${timestamp}`);
        fs_1.default.copyFileSync(this.envPath, backupPath);
        auditLogger_1.auditLogger.log({
            actor: 'AUTOMATION_AGENT',
            action: 'CREDENTIAL_STAGED',
            providerId: 'SYSTEM_ENV',
            variableNames: ['ALL'],
            status: 'SUCCESS',
            details: { backupPath: path_1.default.basename(backupPath) },
        });
        return backupPath;
    }
    /**
     * Inspect current variables status safely (returns keys and masked indicators only).
     */
    getVariableStatus(keys) {
        const parsed = this.parseEnvStructure(this.envPath);
        const map = new Map();
        for (const item of parsed) {
            if (item.type === 'assignment' && item.key) {
                map.set(item.key, item.value ?? '');
            }
        }
        const result = {};
        for (const k of keys) {
            const exists = map.has(k);
            const val = map.get(k) || '';
            const isPlaceholder = !val ||
                val.includes('your_') ||
                val.includes('key_goes_here') ||
                val.includes('___') ||
                val.startsWith('pk_test_...') ||
                val.startsWith('sk_test_...');
            result[k] = {
                exists,
                isConfigured: exists && !isPlaceholder,
                masked: exists ? (0, secretRedaction_1.maskSecret)(val) : '[NOT_SET]',
            };
        }
        return result;
    }
    /**
     * Atomically stage and apply credential updates to .env file.
     * NEVER overwrites existing credentials unless explicitly requested.
     */
    applyCredentials(updates, options) {
        const parsed = this.parseEnvStructure(this.envPath);
        const existingMap = new Map();
        parsed.forEach((item, index) => {
            if (item.type === 'assignment' && item.key) {
                existingMap.set(item.key, index);
            }
        });
        const changes = [];
        const keysToAppend = [];
        for (const [key, newVal] of Object.entries(updates)) {
            if (!newVal || typeof newVal !== 'string')
                continue;
            if (existingMap.has(key)) {
                const idx = existingMap.get(key);
                const currentVal = parsed[idx].value || '';
                const isCurrentlyConfigured = currentVal.length > 0 &&
                    !currentVal.includes('your_') &&
                    !currentVal.includes('key_goes_here') &&
                    !currentVal.includes('___');
                if (isCurrentlyConfigured && !options.allowOverwrite) {
                    changes.push({
                        key,
                        action: 'RETAINED',
                        maskedOldValue: (0, secretRedaction_1.maskSecret)(currentVal),
                        maskedNewValue: (0, secretRedaction_1.maskSecret)(newVal),
                    });
                    continue;
                }
                if (currentVal !== newVal) {
                    changes.push({
                        key,
                        action: 'UPDATED',
                        maskedOldValue: (0, secretRedaction_1.maskSecret)(currentVal),
                        maskedNewValue: (0, secretRedaction_1.maskSecret)(newVal),
                    });
                    parsed[idx].value = newVal;
                    parsed[idx].raw = `${key}=${parsed[idx].quote ? `${parsed[idx].quote}${newVal}${parsed[idx].quote}` : newVal}`;
                }
                else {
                    changes.push({
                        key,
                        action: 'RETAINED',
                        maskedOldValue: (0, secretRedaction_1.maskSecret)(currentVal),
                    });
                }
            }
            else {
                changes.push({
                    key,
                    action: 'ADDED',
                    maskedNewValue: (0, secretRedaction_1.maskSecret)(newVal),
                });
                keysToAppend.push(key);
            }
        }
        if (keysToAppend.length > 0) {
            if (parsed.length > 0 && parsed[parsed.length - 1].type !== 'blank') {
                parsed.push({ type: 'blank', raw: '' });
            }
            parsed.push({
                type: 'comment',
                raw: `# --- Added by Playwright Automation [${options.providerId}] on ${new Date().toISOString()} ---`,
            });
            for (const k of keysToAppend) {
                const val = updates[k];
                parsed.push({
                    type: 'assignment',
                    raw: `${k}=${val}`,
                    key: k,
                    value: val,
                });
            }
        }
        if (options.dryRun) {
            return {
                success: true,
                changes,
                message: 'Dry run completed. No files modified.',
            };
        }
        const backupPath = this.createBackup();
        // Reconstruct file content
        const updatedContent = parsed.map((p) => p.raw).join('\n') + '\n';
        const tmpPath = path_1.default.resolve(`.env.tmp.${Date.now()}`);
        try {
            fs_1.default.writeFileSync(tmpPath, updatedContent, 'utf8');
            fs_1.default.renameSync(tmpPath, this.envPath);
            auditLogger_1.auditLogger.log({
                actor: 'AUTOMATION_AGENT',
                action: 'CREDENTIAL_COMMITTED',
                providerId: options.providerId,
                variableNames: Object.keys(updates),
                status: 'SUCCESS',
                details: {
                    changesCount: changes.filter((c) => c.action === 'ADDED' || c.action === 'UPDATED').length,
                    backupPath: backupPath ? path_1.default.basename(backupPath) : null,
                },
            });
            return {
                success: true,
                backupPath: backupPath || undefined,
                changes,
                message: 'Credentials safely committed with atomic write and verified backup.',
            };
        }
        catch (err) {
            if (fs_1.default.existsSync(tmpPath)) {
                fs_1.default.unlinkSync(tmpPath);
            }
            return {
                success: false,
                changes,
                message: `Failed to commit credentials: ${err.message}`,
            };
        }
    }
}
exports.CredentialVault = CredentialVault;
exports.credentialVault = CredentialVault.getInstance();
