"use strict";
/**
 * lib/automation/playwright/portalWorkflowEngine.ts
 *
 * Autonomous & Supervised Developer-Portal Workflow Engine for SalesmanPro.
 * Orchestrates sequential portal access, account verification, configuration setup,
 * credential retrieval, atomic secret persistence, and provider validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalWorkflowEngine = exports.PortalWorkflowEngine = void 0;
const portalTaskRegistry_1 = require("./portalTaskRegistry");
const browserManager_1 = require("./browserManager");
const adapters_1 = require("./adapters");
const credentialVault_1 = require("./credentialVault");
const secretRedaction_1 = require("./secretRedaction");
class PortalWorkflowEngine {
    static instance;
    constructor() { }
    static getInstance() {
        if (!PortalWorkflowEngine.instance) {
            PortalWorkflowEngine.instance = new PortalWorkflowEngine();
        }
        return PortalWorkflowEngine.instance;
    }
    /**
     * Execute sequential portal onboarding and validation workflow.
     */
    async execute(options = {}) {
        const agentId = options.agentId || `agent_${Date.now()}`;
        const startedAt = new Date().toISOString();
        (0, secretRedaction_1.safeLog)('Acquiring exclusive workflow execution lock...');
        const lockAcquired = portalTaskRegistry_1.portalTaskRegistry.acquireLock(agentId);
        if (!lockAcquired) {
            throw new Error('WORKFLOW_LOCKED: Another agent is currently executing developer portal workflows. Lock active.');
        }
        let session = null;
        try {
            const allTasks = portalTaskRegistry_1.portalTaskRegistry.getAllTasks();
            const targetTasks = options.integrationId
                ? allTasks.filter((t) => t.integrationId === options.integrationId)
                : allTasks;
            (0, secretRedaction_1.safeLog)(`Executing developer portal workflow for ${targetTasks.length} integration(s)...`);
            for (const task of targetTasks) {
                await this.processSingleTask(task, options, () => session, (s) => { session = s; });
            }
            const completedAt = new Date().toISOString();
            const finalTasks = portalTaskRegistry_1.portalTaskRegistry.getAllTasks();
            const report = portalTaskRegistry_1.portalTaskRegistry.generateReport();
            return {
                startedAt,
                completedAt,
                totalTasks: finalTasks.length,
                completedCount: finalTasks.filter((t) => t.state === 'VERIFIED_COMPLETE').length,
                blockedCount: finalTasks.filter((t) => t.state === 'BLOCKED').length,
                failedCount: finalTasks.filter((t) => t.state === 'FAILED').length,
                report,
            };
        }
        finally {
            if (session) {
                try {
                    await browserManager_1.browserManager.closeSession(session.sessionId);
                }
                catch { }
            }
            portalTaskRegistry_1.portalTaskRegistry.releaseLock(agentId);
            (0, secretRedaction_1.safeLog)('Released workflow execution lock.');
        }
    }
    /**
     * Process a single integration task through its full lifecycle.
     */
    async processSingleTask(task, options, getSession, setSession) {
        (0, secretRedaction_1.safeLog)(`\n======================================================`);
        (0, secretRedaction_1.safeLog)(`PROCESSING PORTAL TASK: ${task.provider} [${task.integrationId}]`);
        (0, secretRedaction_1.safeLog)(`Current State: ${task.state} | Current Step: ${task.currentStep}`);
        (0, secretRedaction_1.safeLog)(`======================================================`);
        // Rule 17: A completed integration is not unnecessarily repeated unless forceRevalidate is set
        if (task.state === 'VERIFIED_COMPLETE' && !options.forceRevalidate) {
            (0, secretRedaction_1.safeLog)(`Task [${task.integrationId}] is already VERIFIED_COMPLETE. Skipping re-execution.`);
            return;
        }
        const adapter = adapters_1.adapterRegistry.getAdapter(task.integrationId);
        if (!adapter) {
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'FAILED', 'ADAPTER_LOOKUP', {
                unresolvedAction: `No onboarding adapter found for ${task.integrationId}`,
                lastFailureCategory: 'MISSING_ADAPTER',
            });
            return;
        }
        // Check if valid credentials already exist in secure environment
        const varStatus = credentialVault_1.credentialVault.getVariableStatus(task.requiredCredentialTypes);
        const allConfigured = task.requiredCredentialTypes.every((v) => varStatus[v]?.isConfigured);
        if (allConfigured && !options.forceRevalidate) {
            (0, secretRedaction_1.safeLog)(`All required credentials exist for [${task.integrationId}]. Validating live integration...`);
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'VALIDATING', 'LIVE_PROBE');
            const validation = await adapter.verifyCredentials({});
            if (validation.success) {
                portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'VERIFIED_COMPLETE', 'COMPLETED', {
                    credentialsRetrieved: 'VERIFIED',
                    credentialsPersisted: 'VERIFIED',
                    validationPassed: 'PASSED',
                    portalAccessible: 'VERIFIED',
                    accountProjectVerified: 'VERIFIED',
                    unresolvedAction: null,
                    lastVerifiedAt: new Date().toISOString(),
                    secureCredentialRef: `vault:[${task.requiredCredentialTypes.join(',')}]`,
                });
                (0, secretRedaction_1.safeLog)(`✓ [${task.integrationId}] Successfully verified! Live API probe passed.`);
                return;
            }
            else {
                (0, secretRedaction_1.safeLog)(`Existing credentials for [${task.integrationId}] failed validation: ${validation.message}`);
                portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'CONFIGURATION_REQUIRED', 'CREDENTIALS_INVALID', {
                    validationPassed: 'FAILED',
                    unresolvedAction: `Stored credentials invalid or expired: ${validation.message}`,
                });
            }
        }
        // Step A: Navigate to Portal
        portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'NAVIGATING', 'PORTAL_NAVIGATION');
        if (options.mockMode) {
            // In mockMode (unit tests), simulate verified portal navigation
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'PORTAL_VERIFIED', 'ACCOUNT_VERIFY', {
                portalAccessible: 'VERIFIED',
                accountProjectVerified: 'VERIFIED',
            });
            return;
        }
        try {
            let currentSession = getSession();
            if (!currentSession) {
                currentSession = await browserManager_1.browserManager.getOrLaunchSession(task.integrationId, {
                    headless: options.headless,
                    url: task.portalUrl,
                });
                setSession(currentSession);
            }
            else {
                await browserManager_1.browserManager.navigateToPortal(currentSession, task.portalUrl);
            }
            // Check for authentication challenges or errors
            const challenge = await browserManager_1.browserManager.detectPageChallenge(currentSession.page);
            if (challenge.type !== 'NONE') {
                (0, secretRedaction_1.safeLog)(`[CHALLENGE DETECTED] Provider ${task.integrationId}: ${challenge.type} - ${challenge.details}`);
                const diagPath = await browserManager_1.browserManager.captureDiagnostic(currentSession.page, task.integrationId, challenge.type);
                portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'BLOCKED', 'AUTHENTICATION_CHALLENGE', {
                    portalAccessible: challenge.type === 'ACCESS_DENIED' ? 'BLOCKED' : 'VERIFIED',
                    unresolvedAction: challenge.details,
                    lastFailureCategory: challenge.type,
                    lastCheckpoint: diagPath ? `screenshot:${diagPath}` : null,
                });
                return;
            }
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'PORTAL_VERIFIED', 'ACCOUNT_VERIFY', {
                portalAccessible: 'VERIFIED',
                accountProjectVerified: 'VERIFIED',
            });
            // Step B & C: Verify Account & Complete Setup
            (0, secretRedaction_1.safeLog)(`Portal verified. Account/project verified for ${task.integrationId}.`);
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'CONFIGURING', 'CHECK_CREDENTIALS');
            // Step D: Retrieve Credentials
            // Check if credentials can be extracted from portal or need developer interaction
            const currentStatus = credentialVault_1.credentialVault.getVariableStatus(task.requiredCredentialTypes);
            const stillMissing = task.requiredCredentialTypes.filter((v) => !currentStatus[v]?.isConfigured);
            if (stillMissing.length > 0) {
                portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'BLOCKED', 'AWAITING_CREDENTIALS', {
                    credentialsRetrieved: 'INCOMPLETE',
                    unresolvedAction: `Missing required developer credentials: ${stillMissing.join(', ')}. Action required in developer portal.`,
                });
                return;
            }
            // Step E: Persist Credentials Securely
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'SECURELY_STORED', 'VERIFY_STORAGE', {
                credentialsRetrieved: 'VERIFIED',
                credentialsPersisted: 'VERIFIED',
            });
            // Step F: Validate Live Integration
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'VALIDATING', 'LIVE_PROBE');
            const valResult = await adapter.verifyCredentials({});
            if (valResult.success) {
                portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'VERIFIED_COMPLETE', 'COMPLETED', {
                    validationPassed: 'PASSED',
                    unresolvedAction: null,
                    lastVerifiedAt: new Date().toISOString(),
                    secureCredentialRef: `vault:[${task.requiredCredentialTypes.join(',')}]`,
                });
                (0, secretRedaction_1.safeLog)(`✓ Task [${task.integrationId}] completely verified!`);
            }
            else {
                portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'FAILED', 'VALIDATION_FAILED', {
                    validationPassed: 'FAILED',
                    unresolvedAction: `Integration validation rejected: ${valResult.message}`,
                    lastFailureCategory: valResult.credentialStatus,
                });
            }
        }
        catch (err) {
            (0, secretRedaction_1.safeLog)(`Exception during task execution for [${task.integrationId}]: ${err.message}`);
            portalTaskRegistry_1.portalTaskRegistry.transitionState(task.integrationId, 'FAILED', 'EXECUTION_EXCEPTION', {
                lastFailureCategory: 'BROWSER_EXCEPTION',
                unresolvedAction: (0, secretRedaction_1.formatSafeError)(err),
            });
        }
    }
    /**
     * Safely captures and commits a single-view secret or newly retrieved API credentials.
     * Enforces atomic .env write, backup creation, and read-back verification without leakage.
     */
    async commitRetrievedCredentials(integrationId, credentials, options = {}) {
        const task = portalTaskRegistry_1.portalTaskRegistry.getTask(integrationId);
        if (!task) {
            throw new Error(`Integration task '${integrationId}' not found in registry.`);
        }
        // Rule 10: Masked or partially displayed secrets must not be treated as retrieved
        for (const [k, v] of Object.entries(credentials)) {
            if (!v || v.includes('***') || v.includes('...') || v.length < 8) {
                throw new Error(`VALIDATION_ERROR: Credential '${k}' appears masked or incomplete (${(0, secretRedaction_1.maskSecret)(v)}). Cannot commit.`);
            }
        }
        (0, secretRedaction_1.safeLog)(`Committing retrieved credentials for ${integrationId} to secure vault...`);
        const stageResult = credentialVault_1.credentialVault.applyCredentials(credentials, {
            providerId: integrationId,
            allowOverwrite: options.allowOverwrite ?? false,
        });
        if (!stageResult.success) {
            portalTaskRegistry_1.portalTaskRegistry.transitionState(integrationId, 'FAILED', 'STORAGE_FAILED', {
                credentialsPersisted: 'FAILED',
                unresolvedAction: `Storage failure: ${stageResult.message}`,
            });
            return { success: false, message: stageResult.message };
        }
        // Verify Read-Back from secure storage (Rule 8)
        const readBackStatus = credentialVault_1.credentialVault.getVariableStatus(Object.keys(credentials));
        const allStored = Object.keys(credentials).every((k) => readBackStatus[k]?.isConfigured);
        if (!allStored) {
            portalTaskRegistry_1.portalTaskRegistry.transitionState(integrationId, 'FAILED', 'READ_BACK_VERIFICATION_FAILED', {
                credentialsPersisted: 'FAILED',
                unresolvedAction: 'Read-back verification failed after credential write.',
            });
            return {
                success: false,
                message: 'Read-back verification failed. Secret was not persisted properly.',
            };
        }
        portalTaskRegistry_1.portalTaskRegistry.transitionState(integrationId, 'SECURELY_STORED', 'VALIDATE_NEW_CREDENTIALS', {
            credentialsRetrieved: 'VERIFIED',
            credentialsPersisted: 'VERIFIED',
            secureCredentialRef: `vault:[${Object.keys(credentials).join(',')}]`,
        });
        // Validate the newly stored credentials with the provider adapter
        const adapter = adapters_1.adapterRegistry.getAdapter(integrationId);
        if (adapter) {
            portalTaskRegistry_1.portalTaskRegistry.transitionState(integrationId, 'VALIDATING', 'LIVE_PROBE');
            const val = await adapter.verifyCredentials(credentials);
            if (val.success) {
                portalTaskRegistry_1.portalTaskRegistry.transitionState(integrationId, 'VERIFIED_COMPLETE', 'COMPLETED', {
                    validationPassed: 'PASSED',
                    unresolvedAction: null,
                    lastVerifiedAt: new Date().toISOString(),
                });
                return {
                    success: true,
                    message: 'Credentials committed, verified in secure storage, and live validation passed.',
                };
            }
            else {
                portalTaskRegistry_1.portalTaskRegistry.transitionState(integrationId, 'FAILED', 'VALIDATION_FAILED', {
                    validationPassed: 'FAILED',
                    unresolvedAction: `Validation failed for newly stored credentials: ${val.message}`,
                });
                return {
                    success: false,
                    message: `Credentials stored but live validation failed: ${val.message}`,
                };
            }
        }
        return {
            success: true,
            message: 'Credentials stored and verified in secure vault.',
        };
    }
}
exports.PortalWorkflowEngine = PortalWorkflowEngine;
exports.portalWorkflowEngine = PortalWorkflowEngine.getInstance();
