"use strict";
/**
 * lib/automation/playwright/portalTaskRegistry.ts
 *
 * Explicit Developer-Portal Task Registry for SalesmanPro.
 * Tracks stateful developer portal onboarding, credential discovery,
 * permission verification, atomic storage, and healthcheck validation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalTaskRegistry = exports.PortalTaskRegistry = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const credentialVault_1 = require("./credentialVault");
const auditLogger_1 = require("./auditLogger");
const adapters_1 = require("./adapters");
class PortalTaskRegistry {
    static instance;
    registryFilePath;
    lockFilePath;
    data = null;
    constructor() {
        const storageDir = path_1.default.resolve('storage', 'automation');
        if (!fs_1.default.existsSync(storageDir)) {
            fs_1.default.mkdirSync(storageDir, { recursive: true });
        }
        this.registryFilePath = path_1.default.join(storageDir, 'portal-task-registry.json');
        this.lockFilePath = path_1.default.join(storageDir, 'portal-workflow.lock');
        this.load();
    }
    static getInstance() {
        if (!PortalTaskRegistry.instance) {
            PortalTaskRegistry.instance = new PortalTaskRegistry();
        }
        return PortalTaskRegistry.instance;
    }
    /**
     * Acquire exclusive execution lock to prevent concurrent portal workflows.
     */
    acquireLock(agentId = 'agent-autonomous-worker', maxAgeMs = 15 * 60 * 1000) {
        if (fs_1.default.existsSync(this.lockFilePath)) {
            try {
                const raw = fs_1.default.readFileSync(this.lockFilePath, 'utf8');
                const lockInfo = JSON.parse(raw);
                const age = Date.now() - new Date(lockInfo.acquiredAt).getTime();
                if (age < maxAgeMs) {
                    if (lockInfo.agentId === agentId) {
                        return true; // Already held by same agent
                    }
                    return false; // Held by active external agent
                }
                // Stale lock, overwrite
            }
            catch {
                // Corrupt lock file, overwrite
            }
        }
        const lockData = {
            agentId,
            acquiredAt: new Date().toISOString(),
            pid: process.pid,
        };
        fs_1.default.writeFileSync(this.lockFilePath, JSON.stringify(lockData, null, 2), 'utf8');
        if (this.data) {
            this.data.activeLockId = agentId;
            this.save();
        }
        return true;
    }
    /**
     * Release execution lock.
     */
    releaseLock(agentId = 'agent-autonomous-worker') {
        if (fs_1.default.existsSync(this.lockFilePath)) {
            try {
                const raw = fs_1.default.readFileSync(this.lockFilePath, 'utf8');
                const lockInfo = JSON.parse(raw);
                if (lockInfo.agentId === agentId) {
                    fs_1.default.unlinkSync(this.lockFilePath);
                }
            }
            catch {
                try {
                    fs_1.default.unlinkSync(this.lockFilePath);
                }
                catch { }
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
    load() {
        if (fs_1.default.existsSync(this.registryFilePath)) {
            try {
                const raw = fs_1.default.readFileSync(this.registryFilePath, 'utf8');
                this.data = JSON.parse(raw);
                return this.data;
            }
            catch (err) {
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
    populateInitialTasks() {
        if (!this.data)
            return;
        const adapters = adapters_1.adapterRegistry.getAllAdapters();
        for (const adapter of adapters) {
            const meta = adapter.metadata;
            const requiredVars = meta.fields.map((f) => f.envVar);
            const varStatus = credentialVault_1.credentialVault.getVariableStatus(requiredVars);
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
    save() {
        if (!this.data)
            return;
        this.data.updatedAt = new Date().toISOString();
        const tmpPath = `${this.registryFilePath}.tmp.${Date.now()}`;
        fs_1.default.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf8');
        fs_1.default.renameSync(tmpPath, this.registryFilePath);
    }
    getTask(integrationId) {
        if (!this.data)
            this.load();
        return this.data?.tasks[integrationId] || null;
    }
    getAllTasks() {
        if (!this.data)
            this.load();
        return Object.values(this.data?.tasks || {});
    }
    /**
     * Transition state and record checkpoint.
     */
    transitionState(integrationId, toState, step, updates = {}, note) {
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
        auditLogger_1.auditLogger.log({
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
    resetTask(integrationId) {
        const task = this.getTask(integrationId);
        if (!task)
            throw new Error(`Task '${integrationId}' not found`);
        return this.transitionState(integrationId, 'PENDING', 'RESET', {
            portalAccessible: 'PENDING',
            accountProjectVerified: 'UNVERIFIED',
            credentialsRetrieved: 'INCOMPLETE',
            credentialsPersisted: 'NOT_APPLICABLE',
            validationPassed: 'NOT_RUN',
            unresolvedAction: 'Task reset for re-execution',
            retryCount: 0,
            lastFailureCategory: null,
        }, 'User or operator triggered reset');
    }
    /**
     * Generates the authoritative progress report required by Phase Eight.
     * NEVER includes secret values.
     */
    generateReport() {
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
exports.PortalTaskRegistry = PortalTaskRegistry;
exports.portalTaskRegistry = PortalTaskRegistry.getInstance();
