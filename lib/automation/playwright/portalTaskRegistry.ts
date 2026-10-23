/**
 * lib/automation/playwright/portalTaskRegistry.ts
 *
 * Explicit Developer-Portal Task Registry for SalesmanPro.
 * Tracks stateful developer portal onboarding, credential discovery,
 * permission verification, atomic storage, and healthcheck validation.
 */

import fs from 'fs';
import path from 'path';
import { credentialVault } from './credentialVault';
import { auditLogger } from './auditLogger';
import { adapterRegistry } from './adapters';

export type PortalTaskState =
  | 'PENDING'
  | 'NAVIGATING'
  | 'PORTAL_VERIFIED'
  | 'CONFIGURATION_REQUIRED'
  | 'CONFIGURING'
  | 'CREDENTIALS_RETRIEVED'
  | 'SECURELY_STORED'
  | 'VALIDATING'
  | 'VERIFIED_COMPLETE'
  | 'BLOCKED'
  | 'RETRY_PENDING'
  | 'FAILED';

export interface PortalTask {
  integrationId: string;
  provider: string;
  portalUrl: string;
  requiredAccount: string;
  requiredCredentialTypes: string[];
  credentialsExist: boolean;
  portalAccessible: 'VERIFIED' | 'BLOCKED' | 'FAILED' | 'PENDING';
  accountProjectVerified: 'VERIFIED' | 'UNVERIFIED';
  appRegistrationRequired: boolean;
  consentPermissionsConfigRequired: boolean;
  credentialGenerationRequired: boolean;
  credentialsRetrieved: 'VERIFIED' | 'INCOMPLETE' | 'BLOCKED';
  credentialsPersisted: 'VERIFIED' | 'FAILED' | 'NOT_APPLICABLE';
  validationPassed: 'PASSED' | 'FAILED' | 'NOT_RUN';
  unresolvedAction: string | null;
  state: PortalTaskState;
  currentStep: string;
  lastCheckpoint: string | null;
  retryCount: number;
  lastFailureCategory: string | null;
  lastVerifiedAt: string | null;
  secureCredentialRef: string | null;
  detectedAccount?: string | null;
  detectedProject?: string | null;
  history: Array<{
    timestamp: string;
    fromState: PortalTaskState;
    toState: PortalTaskState;
    step: string;
    note?: string;
  }>;
}

export interface TaskRegistryData {
  version: string;
  updatedAt: string;
  activeLockId: string | null;
  tasks: Record<string, PortalTask>;
}

export class PortalTaskRegistry {
  private static instance: PortalTaskRegistry;
  private registryFilePath: string;
  private lockFilePath: string;
  private data: TaskRegistryData | null = null;

  private constructor() {
    const storageDir = path.resolve('storage', 'automation');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.registryFilePath = path.join(storageDir, 'portal-task-registry.json');
    this.lockFilePath = path.join(storageDir, 'portal-workflow.lock');
    this.load();
  }

  public static getInstance(): PortalTaskRegistry {
    if (!PortalTaskRegistry.instance) {
      PortalTaskRegistry.instance = new PortalTaskRegistry();
    }
    return PortalTaskRegistry.instance;
  }

  /**
   * Acquire exclusive execution lock to prevent concurrent portal workflows.
   */
  public acquireLock(agentId = 'agent-autonomous-worker', maxAgeMs = 15 * 60 * 1000): boolean {
    if (fs.existsSync(this.lockFilePath)) {
      try {
        const raw = fs.readFileSync(this.lockFilePath, 'utf8');
        const lockInfo = JSON.parse(raw);
        const age = Date.now() - new Date(lockInfo.acquiredAt).getTime();
        if (age < maxAgeMs) {
          if (lockInfo.agentId === agentId) {
            return true; // Already held by same agent
          }
          return false; // Held by active external agent
        }
        // Stale lock, overwrite
      } catch {
        // Corrupt lock file, overwrite
      }
    }

    const lockData = {
      agentId,
      acquiredAt: new Date().toISOString(),
      pid: process.pid,
    };
    fs.writeFileSync(this.lockFilePath, JSON.stringify(lockData, null, 2), 'utf8');
    if (this.data) {
      this.data.activeLockId = agentId;
      this.save();
    }
    return true;
  }

  /**
   * Release execution lock.
   */
  public releaseLock(agentId = 'agent-autonomous-worker'): void {
    if (fs.existsSync(this.lockFilePath)) {
      try {
        const raw = fs.readFileSync(this.lockFilePath, 'utf8');
        const lockInfo = JSON.parse(raw);
        if (lockInfo.agentId === agentId) {
          fs.unlinkSync(this.lockFilePath);
        }
      } catch {
        try {
          fs.unlinkSync(this.lockFilePath);
        } catch {}
      }
    }
    if (this.data && this.data.activeLockId === agentId) {
      this.data.activeLockId = null;
      this.save();
    }
  }

  /**
   * Load registry from disk or initialize from registered provider adapters.
   */
  public load(): TaskRegistryData {
    if (fs.existsSync(this.registryFilePath)) {
      try {
        const raw = fs.readFileSync(this.registryFilePath, 'utf8');
        this.data = JSON.parse(raw);
        return this.data!;
      } catch (err) {
        console.warn('[TaskRegistry] Corrupt registry file, re-initializing from adapter metadata');
      }
    }

    this.data = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      activeLockId: null,
      tasks: {},
    };

    this.populateInitialTasks();
    this.save();
    return this.data;
  }

  /**
   * Initialize task objects from canonical provider adapters and environment inspection.
   */
  private populateInitialTasks(): void {
    if (!this.data) return;

    const adapters = adapterRegistry.getAllAdapters();
    for (const adapter of adapters) {
      const meta = adapter.metadata;
      const requiredVars = meta.fields.map((f) => f.envVar);
      const varStatus = credentialVault.getVariableStatus(requiredVars);

      const allConfigured = requiredVars.length > 0 && requiredVars.every((v) => varStatus[v]?.isConfigured);
      const someConfigured = requiredVars.some((v) => varStatus[v]?.isConfigured);

      this.data.tasks[meta.providerId] = {
        integrationId: meta.providerId,
        provider: meta.serviceName,
        portalUrl: meta.portalUrl,
        requiredAccount: meta.accountType || `${meta.serviceName} Developer Account`,
        requiredCredentialTypes: requiredVars,
        credentialsExist: someConfigured,
        portalAccessible: 'PENDING',
        accountProjectVerified: 'UNVERIFIED',
        appRegistrationRequired: meta.providerId.includes('meta') || meta.providerId.includes('google'),
        consentPermissionsConfigRequired: (meta.requiredScopes && meta.requiredScopes.length > 0) || false,
        credentialGenerationRequired: !allConfigured,
        credentialsRetrieved: allConfigured ? 'VERIFIED' : 'INCOMPLETE',
        credentialsPersisted: allConfigured ? 'VERIFIED' : 'NOT_APPLICABLE',
        validationPassed: 'NOT_RUN',
        unresolvedAction: allConfigured ? null : 'Awaiting developer portal authentication and credential retrieval',
        state: allConfigured ? 'VALIDATING' : 'PENDING',
        currentStep: allConfigured ? 'READY_FOR_VALIDATION' : 'INITIAL_SETUP_REQUIRED',
        lastCheckpoint: null,
        retryCount: 0,
        lastFailureCategory: null,
        lastVerifiedAt: null,
        secureCredentialRef: allConfigured ? `env:[${requiredVars.join(',')}]` : null,
        detectedAccount: null,
        detectedProject: null,
        history: [
          {
            timestamp: new Date().toISOString(),
            fromState: 'PENDING',
            toState: allConfigured ? 'VALIDATING' : 'PENDING',
            step: 'INITIALIZE',
            note: allConfigured ? 'Existing credentials detected in secure environment' : 'New integration task created',
          },
        ],
      };
    }
  }

  /**
   * Atomic save to disk.
   */
  public save(): void {
    if (!this.data) return;
    this.data.updatedAt = new Date().toISOString();

    const tmpPath = `${this.registryFilePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(tmpPath, this.registryFilePath);
  }

  public getTask(integrationId: string): PortalTask | null {
    if (!this.data) this.load();
    return this.data?.tasks[integrationId] || null;
  }

  public getAllTasks(): PortalTask[] {
    if (!this.data) this.load();
    return Object.values(this.data?.tasks || {});
  }

  /**
   * Transition state and record checkpoint.
   */
  public transitionState(
    integrationId: string,
    toState: PortalTaskState,
    step: string,
    updates: Partial<PortalTask> = {},
    note?: string
  ): PortalTask {
    const task = this.getTask(integrationId);
    if (!task) {
      throw new Error(`Task with id '${integrationId}' not found in registry.`);
    }

    const fromState = task.state;
    task.state = toState;
    task.currentStep = step;
    task.lastCheckpoint = new Date().toISOString();

    Object.assign(task, updates);

    task.history.push({
      timestamp: new Date().toISOString(),
      fromState,
      toState,
      step,
      note,
    });

    auditLogger.log({
      actor: 'AUTOMATION_AGENT',
      action: toState === 'VERIFIED_COMPLETE' ? 'VERIFICATION_PASSED' : 'PORTAL_ACCESS',
      providerId: integrationId,
      variableNames: task.requiredCredentialTypes,
      status: toState === 'FAILED' ? 'FAILURE' : toState === 'BLOCKED' ? 'BLOCKED' : 'SUCCESS',
      details: {
        fromState,
        toState,
        step,
        checkpoint: task.lastCheckpoint,
        unresolvedAction: task.unresolvedAction,
      },
    });

    this.save();
    return task;
  }

  /**
   * Reset a task back to PENDING for re-run.
   */
  public resetTask(integrationId: string): PortalTask {
    const task = this.getTask(integrationId);
    if (!task) throw new Error(`Task '${integrationId}' not found`);

    return this.transitionState(
      integrationId,
      'PENDING',
      'RESET',
      {
        portalAccessible: 'PENDING',
        accountProjectVerified: 'UNVERIFIED',
        credentialsRetrieved: 'INCOMPLETE',
        credentialsPersisted: 'NOT_APPLICABLE',
        validationPassed: 'NOT_RUN',
        unresolvedAction: 'Task reset for re-execution',
        retryCount: 0,
        lastFailureCategory: null,
      },
      'User or operator triggered reset'
    );
  }

  /**
   * Generates the authoritative progress report required by Phase Eight.
   * NEVER includes secret values.
   */
  public generateReport(): string {
    const tasks = this.getAllTasks();

    let output = '# SalesmanPro Developer Portal Access & Integration Verification Report\n\n';
    output += `Generated At: ${new Date().toISOString()}\n`;
    output += `Total Integrations Registered: ${tasks.length}\n\n`;

    output += '| Provider & Integration | Portal Access | Correct Account/Project | Required Setup | Credential Retrieval | Secure Persistence | Integration Validation | Status & Outstanding Actions |\n';
    output += '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n';

    for (const t of tasks) {
      const requiredSetupText = t.appRegistrationRequired || t.consentPermissionsConfigRequired
        ? (t.state === 'VERIFIED_COMPLETE' || t.state === 'VALIDATING' ? 'COMPLETE' : 'INCOMPLETE')
        : 'NOT REQUIRED';

      const outstanding = t.unresolvedAction
        ? t.unresolvedAction.replace(/\|/g, '/')
        : (t.state === 'VERIFIED_COMPLETE' ? 'None (Verified Complete)' : 'In Progress');

      output += `| **${t.provider}** (\`${t.integrationId}\`) | ${t.portalAccessible} | ${t.accountProjectVerified} | ${requiredSetupText} | ${t.credentialsRetrieved} | ${t.credentialsPersisted} | ${t.validationPassed} | ${t.state}: ${outstanding} |\n`;
    }

    output += '\n## Summary\n';
    const complete = tasks.filter((t) => t.state === 'VERIFIED_COMPLETE').length;
    const blocked = tasks.filter((t) => t.state === 'BLOCKED').length;
    const pending = tasks.filter((t) => t.state !== 'VERIFIED_COMPLETE' && t.state !== 'BLOCKED').length;

    output += `- **Verified Complete**: ${complete} / ${tasks.length}\n`;
    output += `- **Blocked (Requires User Intervention / Auth)**: ${blocked}\n`;
    output += `- **Pending / Incomplete**: ${pending}\n`;

    return output;
  }
}

export const portalTaskRegistry = PortalTaskRegistry.getInstance();
