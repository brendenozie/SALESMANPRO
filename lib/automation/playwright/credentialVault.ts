/**
 * lib/automation/playwright/credentialVault.ts
 *
 * Secure local credential vault and atomic .env configuration manager.
 * Manages backup, parsing, atomic updates, and masked diffs without
 * ever logging or leaking secret values.
 */

import fs from 'fs';
import path from 'path';
import { auditLogger } from './auditLogger';
import { maskSecret } from './secretRedaction';

export interface EnvChange {
  key: string;
  action: 'ADDED' | 'UPDATED' | 'RETAINED' | 'REMOVED';
  maskedOldValue?: string;
  maskedNewValue?: string;
}

export interface StagingResult {
  success: boolean;
  backupPath?: string;
  changes: EnvChange[];
  message: string;
}

export class CredentialVault {
  private static instance: CredentialVault;
  private envPath: string;
  private backupDir: string;

  private constructor() {
    this.envPath = path.resolve('.env');
    this.backupDir = path.resolve('storage', 'backups', 'env');
    this.ensureDirs();
  }

  public static getInstance(): CredentialVault {
    if (!CredentialVault.instance) {
      CredentialVault.instance = new CredentialVault();
    }
    return CredentialVault.instance;
  }

  private ensureDirs(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Parse an .env file preserving exact line structures and comments.
   */
  public parseEnvStructure(filePath: string): Array<{
    type: 'comment' | 'blank' | 'assignment';
    raw: string;
    key?: string;
    value?: string;
    quote?: string;
  }> {
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const result: Array<{
      type: 'comment' | 'blank' | 'assignment';
      raw: string;
      key?: string;
      value?: string;
      quote?: string;
    }> = [];

    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) {
        result.push({ type: 'blank', raw });
      } else if (trimmed.startsWith('#')) {
        result.push({ type: 'comment', raw });
      } else {
        const eqIdx = raw.indexOf('=');
        if (eqIdx > 0) {
          const key = raw.substring(0, eqIdx).trim();
          let value = raw.substring(eqIdx + 1).trim();
          let quote = '';
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            quote = value[0];
            value = value.substring(1, value.length - 1);
          }
          result.push({ type: 'assignment', raw, key, value, quote });
        } else {
          result.push({ type: 'comment', raw });
        }
      }
    }
    return result;
  }

  /**
   * Create an automated timestamped backup of the current .env file.
   */
  public createBackup(): string | null {
    if (!fs.existsSync(this.envPath)) {
      return null;
    }
    this.ensureDirs();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `.env.backup.${timestamp}`);

    fs.copyFileSync(this.envPath, backupPath);

    auditLogger.log({
      actor: 'AUTOMATION_AGENT',
      action: 'CREDENTIAL_STAGED',
      providerId: 'SYSTEM_ENV',
      variableNames: ['ALL'],
      status: 'SUCCESS',
      details: { backupPath: path.basename(backupPath) },
    });

    return backupPath;
  }

  /**
   * Inspect current variables status safely (returns keys and masked indicators only).
   */
  public getVariableStatus(keys: string[]): Record<string, { exists: boolean; isConfigured: boolean; masked: string }> {
    const parsed = this.parseEnvStructure(this.envPath);
    const map = new Map<string, string>();
    for (const item of parsed) {
      if (item.type === 'assignment' && item.key) {
        map.set(item.key, item.value ?? '');
      }
    }

    const result: Record<string, { exists: boolean; isConfigured: boolean; masked: string }> = {};
    for (const k of keys) {
      const exists = map.has(k);
      const val = map.get(k) || '';
      const isPlaceholder =
        !val ||
        val.includes('your_') ||
        val.includes('key_goes_here') ||
        val.includes('___') ||
        val.startsWith('pk_test_...') ||
        val.startsWith('sk_test_...');

      result[k] = {
        exists,
        isConfigured: exists && !isPlaceholder,
        masked: exists ? maskSecret(val) : '[NOT_SET]',
      };
    }
    return result;
  }

  /**
   * Atomically stage and apply credential updates to .env file.
   * NEVER overwrites existing credentials unless explicitly requested.
   */
  public applyCredentials(
    updates: Record<string, string>,
    options: {
      providerId: string;
      allowOverwrite?: boolean;
      dryRun?: boolean;
    }
  ): StagingResult {
    const parsed = this.parseEnvStructure(this.envPath);
    const existingMap = new Map<string, number>();

    parsed.forEach((item, index) => {
      if (item.type === 'assignment' && item.key) {
        existingMap.set(item.key, index);
      }
    });

    const changes: EnvChange[] = [];
    const keysToAppend: string[] = [];

    for (const [key, newVal] of Object.entries(updates)) {
      if (!newVal || typeof newVal !== 'string') continue;

      if (existingMap.has(key)) {
        const idx = existingMap.get(key)!;
        const currentVal = parsed[idx].value || '';

        const isCurrentlyConfigured =
          currentVal.length > 0 &&
          !currentVal.includes('your_') &&
          !currentVal.includes('key_goes_here') &&
          !currentVal.includes('___');

        if (isCurrentlyConfigured && !options.allowOverwrite) {
          changes.push({
            key,
            action: 'RETAINED',
            maskedOldValue: maskSecret(currentVal),
            maskedNewValue: maskSecret(newVal),
          });
          continue;
        }

        if (currentVal !== newVal) {
          changes.push({
            key,
            action: 'UPDATED',
            maskedOldValue: maskSecret(currentVal),
            maskedNewValue: maskSecret(newVal),
          });
          parsed[idx].value = newVal;
          parsed[idx].raw = `${key}=${parsed[idx].quote ? `${parsed[idx].quote}${newVal}${parsed[idx].quote}` : newVal}`;
        } else {
          changes.push({
            key,
            action: 'RETAINED',
            maskedOldValue: maskSecret(currentVal),
          });
        }
      } else {
        changes.push({
          key,
          action: 'ADDED',
          maskedNewValue: maskSecret(newVal),
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
    const tmpPath = path.resolve(`.env.tmp.${Date.now()}`);

    try {
      fs.writeFileSync(tmpPath, updatedContent, 'utf8');
      fs.renameSync(tmpPath, this.envPath);

      auditLogger.log({
        actor: 'AUTOMATION_AGENT',
        action: 'CREDENTIAL_COMMITTED',
        providerId: options.providerId,
        variableNames: Object.keys(updates),
        status: 'SUCCESS',
        details: {
          changesCount: changes.filter((c) => c.action === 'ADDED' || c.action === 'UPDATED').length,
          backupPath: backupPath ? path.basename(backupPath) : null,
        },
      });

      return {
        success: true,
        backupPath: backupPath || undefined,
        changes,
        message: 'Credentials safely committed with atomic write and verified backup.',
      };
    } catch (err: any) {
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
      return {
        success: false,
        changes,
        message: `Failed to commit credentials: ${err.message}`,
      };
    }
  }
}

export const credentialVault = CredentialVault.getInstance();
