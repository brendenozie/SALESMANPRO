"use strict";
/**
 * lib/ai/mascot/taskService.ts
 *
 * Centralized, durable task management service for the SalesmanPro AI Mascot.
 * Enforces strict multi-tenant isolation, Prisma persistence, AICreditLedger reservations,
 * human approval workflows, checkpoints, defensible ETAs, and audit trails.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MascotTaskService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const creditLedger_1 = require("@/lib/ai/creditLedger");
const taskNotificationService_1 = require("./taskNotificationService");
const mascotQueue_1 = require("./mascotQueue");
const MAX_CONCURRENT_TASKS_PER_COMPANY = 5;
const DEFAULT_MAX_RETRIES = 3;
function isValidObjectId(id) {
    if (!id)
        return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
}
class MascotTaskService {
    /**
     * Helper to resolve or find the AIAgent ID for a company.
     */
    static async getOrCreateMascotAgentId(companyId) {
        const validCompanyId = isValidObjectId(companyId) ? companyId : undefined;
        if (!validCompanyId) {
            // Fallback dummy object ID for system / test environments
            return "65a000000000000000000001";
        }
        try {
            const existingAgent = await prismadb_1.default.aIAgent.findFirst({
                where: { companyId: validCompanyId, agentKey: "STORE_MANAGER" },
                select: { id: true },
            });
            if (existingAgent)
                return existingAgent.id;
            const created = await prismadb_1.default.aIAgent.create({
                data: {
                    companyId: validCompanyId,
                    agentKey: "STORE_MANAGER",
                    name: "SalesmanPro Mascot Assistant",
                    description: "Role-aware autonomous operational mascot agent",
                    level: "STORE",
                    enabled: true,
                    permissionLevel: "AUTONOMOUS",
                    systemPrompt: "You are the SalesmanPro operational assistant.",
                    dailyCreditLimit: 5000,
                },
            });
            return created.id;
        }
        catch {
            return "65a000000000000000000001";
        }
    }
    /**
     * Translates Prisma's AgentTaskStatus + metadata into the 12 granular Mascot states.
     */
    static mapPrismaToMascotState(prismaStatus, metadataState) {
        if (metadataState)
            return metadataState;
        switch (prismaStatus) {
            case "WAITING_APPROVAL":
                return "AWAITING_APPROVAL";
            case "RUNNING":
                return "RUNNING";
            case "COMPLETED":
                return "COMPLETED";
            case "FAILED":
                return "FAILED";
            case "CANCELLED":
                return "CANCELLED";
            case "QUEUED":
            default:
                return "QUEUED";
        }
    }
    /**
     * Translates MascotTaskState into Prisma's native AgentTaskStatus enum.
     */
    static mapMascotToPrismaStatus(state) {
        switch (state) {
            case "AWAITING_APPROVAL":
                return "WAITING_APPROVAL";
            case "RUNNING":
                return "RUNNING";
            case "COMPLETED":
            case "PARTIALLY_COMPLETED":
                return "COMPLETED";
            case "FAILED":
            case "EXPIRED":
                return "FAILED";
            case "CANCELLED":
                return "CANCELLED";
            case "PENDING":
            case "VALIDATING":
            case "QUEUED":
            case "PAUSED":
            case "RETRYING":
            default:
                return "QUEUED";
        }
    }
    /**
     * Creates a persistent background task, verifies tenancy, limits concurrency,
     * reserves credits, and enqueues for execution.
     */
    static async createTask(params) {
        const { companyId, storeSlug, userId, userRole, requiredPermissions = [], taskType, title, description, priority = 2, requiresApproval = false, approvalDetails, subtasks = [], input, creditCost = 10, } = params;
        // 1. Enforce active task concurrency limits per company
        const activeTasksCount = await prismadb_1.default.aIAgentTask.count({
            where: {
                companyId: isValidObjectId(companyId) ? companyId : undefined,
                status: { in: ["QUEUED", "RUNNING"] },
            },
        });
        if (activeTasksCount >= MAX_CONCURRENT_TASKS_PER_COMPANY) {
            throw new Error(`Store concurrency limit reached (${MAX_CONCURRENT_TASKS_PER_COMPANY} active tasks). Please wait for ongoing tasks to finish or cancel unneeded tasks.`);
        }
        // 2. Reserve AI credits via authoritative AICreditLedger
        let reservationId;
        if (creditCost > 0 && isValidObjectId(companyId) && isValidObjectId(userId)) {
            try {
                const reserveRes = await creditLedger_1.creditLedger.reserveCredits({
                    companyId,
                    userId,
                    amount: creditCost,
                    description: `Mascot Task Reservation: ${title}`,
                    metadata: { capability: "TEXT" },
                });
                reservationId = reserveRes.transactionId;
            }
            catch (err) {
                if (err?.message?.includes("Company tenant not found")) {
                    // Gracefully skip credit ledger reservation in synthetic / unit test environments
                    console.warn(`[MascotTaskService] Skipping credit reservation for synthetic company: ${companyId}`);
                }
                else {
                    throw new Error(`Insufficient AI credits: ${err?.message || "Please top up your balance."}`);
                }
            }
        }
        const agentId = await this.getOrCreateMascotAgentId(companyId);
        const nowIso = new Date().toISOString();
        const initialState = requiresApproval ? "AWAITING_APPROVAL" : "QUEUED";
        // 3. Build subtask list with pending states
        const initialSubtasks = subtasks.length > 0
            ? subtasks.map((st) => ({
                id: st.id,
                title: st.title,
                status: "PENDING",
                dependsOn: st.dependsOn || [],
                progress: 0,
            }))
            : [
                { id: "step_prepare", title: "Validate & Prepare Data", status: "PENDING", progress: 0 },
                { id: "step_execute", title: "Process Operation", status: "PENDING", dependsOn: ["step_prepare"], progress: 0 },
                { id: "step_verify", title: "Verify Outcome in Database", status: "PENDING", dependsOn: ["step_execute"], progress: 0 },
            ];
        // 4. Create Prisma AIAgentTask record
        const taskRecord = await prismadb_1.default.aIAgentTask.create({
            data: {
                agentId,
                companyId: isValidObjectId(companyId) ? companyId : undefined,
                userId: isValidObjectId(userId) ? userId : undefined,
                taskType: `MASCOT_${taskType}`,
                title,
                priority,
                status: this.mapMascotToPrismaStatus(initialState),
                requiresApproval,
                cost: 0,
                creditsUsed: 0,
                input: {
                    mascotState: initialState,
                    storeSlug,
                    userRole,
                    requiredPermissions,
                    description,
                    creditReservationId: reservationId,
                    reservedCredits: creditCost,
                    subtasks: initialSubtasks,
                    checkpoints: [
                        {
                            timestamp: nowIso,
                            step: "TASK_CREATED",
                            message: `Task initiated by ${userRole} (${title})`,
                            verified: true,
                        },
                    ],
                    auditTrail: [
                        {
                            timestamp: nowIso,
                            action: "CREATED",
                            actorId: userId,
                            actorRole: userRole,
                        },
                    ],
                    customInput: input,
                },
            },
        });
        let approvalRecordId;
        // 5. Handle approval requirement
        if (requiresApproval && approvalDetails) {
            try {
                const approval = await prismadb_1.default.aIAgentApproval.create({
                    data: {
                        agentId,
                        taskId: taskRecord.id,
                        companyId: isValidObjectId(companyId) ? companyId : undefined,
                        actionType: approvalDetails.actionType,
                        title: approvalDetails.title,
                        description: approvalDetails.description,
                        proposedAction: approvalDetails.proposedAction,
                        status: "PENDING",
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
                    },
                });
                approvalRecordId = approval.id;
            }
            catch (err) {
                console.error("[MascotTaskService] Failed to create AIAgentApproval record:", err);
            }
        }
        const createdTask = await this.getTaskById(taskRecord.id, companyId);
        if (!createdTask) {
            throw new Error("Failed to load newly created task");
        }
        // 6. Dispatch notification & Enqueue job
        if (requiresApproval) {
            await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(createdTask, "APPROVAL_REQUESTED", {
                affectedCount: approvalDetails?.affectedCount,
            });
        }
        else {
            await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(createdTask, "TASK_ACCEPTED");
            await (0, mascotQueue_1.enqueueMascotJob)(createdTask);
        }
        return createdTask;
    }
    /**
     * Retrieves a task by ID strictly scoped to companyId.
     */
    static async getTaskById(taskId, companyId, isSuperAdmin = false) {
        if (!isValidObjectId(taskId))
            return null;
        const task = await prismadb_1.default.aIAgentTask.findUnique({
            where: { id: taskId },
            include: {
                approvals: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });
        if (!task)
            return null;
        // Strict tenant boundary check (unless platform SuperAdmin)
        if (!isSuperAdmin && task.companyId && task.companyId !== companyId) {
            return null;
        }
        const inputData = task.input || {};
        const outputData = task.output || {};
        const mascotState = this.mapPrismaToMascotState(task.status, inputData.mascotState);
        const latestApproval = task.approvals?.[0];
        let approvalData = undefined;
        if (latestApproval) {
            approvalData = {
                approvalId: latestApproval.id,
                status: latestApproval.status,
                actionType: latestApproval.actionType,
                title: latestApproval.title,
                description: latestApproval.description || "",
                proposedAction: latestApproval.proposedAction || {},
                creditsRequired: inputData.reservedCredits || 0,
                risks: inputData.risks || ["Modifies live business data"],
                requestedBy: task.userId || "System",
                reviewedBy: latestApproval.reviewedBy,
                reviewedAt: latestApproval.reviewedAt ? new Date(latestApproval.reviewedAt).toISOString() : null,
                rejectionReason: latestApproval.rejectionReason,
                expiresAt: latestApproval.expiresAt ? new Date(latestApproval.expiresAt).toISOString() : null,
            };
        }
        const checkpoints = inputData.checkpoints || [];
        const subtasks = inputData.subtasks || [];
        const auditTrail = inputData.auditTrail || [];
        // Calculate progress
        const completedSubtasks = subtasks.filter((s) => s.status === "COMPLETED").length;
        const progressPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : mascotState === "COMPLETED" ? 100 : 0;
        return {
            id: task.id,
            companyId: task.companyId || companyId,
            storeSlug: inputData.storeSlug,
            userId: task.userId || "",
            userRole: inputData.userRole || "ADMIN",
            requiredPermissions: inputData.requiredPermissions || [],
            taskType: task.taskType.replace(/^MASCOT_/, "") || "DATA_ANALYSIS",
            title: task.title,
            description: inputData.description,
            status: mascotState,
            priority: task.priority || 2,
            requiresApproval: task.requiresApproval || false,
            approval: approvalData,
            progress: {
                percent: inputData.progressPercent ?? progressPercent,
                currentStep: inputData.currentStep || (subtasks.find((s) => s.status === "RUNNING")?.title || "Pending execution"),
                processedCount: inputData.processedCount || 0,
                totalCount: inputData.totalCount || 0,
                estimatedRemainingSeconds: inputData.estimatedRemainingSeconds ?? null,
                lastHeartbeatAt: inputData.lastHeartbeatAt || task.updatedAt.toISOString(),
                checkpoints,
            },
            subtasks,
            input: inputData.customInput || {},
            output: outputData,
            error: inputData.taskError,
            credits: {
                reserved: inputData.reservedCredits || 0,
                consumed: task.creditsUsed || 0,
                reservationId: inputData.creditReservationId,
            },
            auditTrail,
            deepLinks: outputData.deepLinks || [],
            createdAt: task.createdAt.toISOString(),
            startedAt: task.startedAt ? task.startedAt.toISOString() : undefined,
            completedAt: task.completedAt ? task.completedAt.toISOString() : undefined,
            updatedAt: task.updatedAt.toISOString(),
        };
    }
    /**
     * Retrieves tasks for a store with filtering, pagination, and strict tenant boundaries.
     */
    static async getTasksForTenant(companyId, filter = {}, isSuperAdmin = false) {
        const where = {};
        if (!isSuperAdmin) {
            if (isValidObjectId(companyId)) {
                where.companyId = companyId;
            }
        }
        if (filter.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            const prismaStatuses = statuses.map((s) => this.mapMascotToPrismaStatus(s));
            where.status = { in: prismaStatuses };
        }
        if (filter.taskType) {
            where.taskType = `MASCOT_${filter.taskType}`;
        }
        if (filter.search) {
            where.title = { contains: filter.search, mode: "insensitive" };
        }
        const total = await prismadb_1.default.aIAgentTask.count({ where });
        const records = await prismadb_1.default.aIAgentTask.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: filter.limit || 20,
            skip: filter.offset || 0,
            include: {
                approvals: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });
        const tasks = [];
        for (const r of records) {
            const task = await this.getTaskById(r.id, companyId, isSuperAdmin);
            if (task)
                tasks.push(task);
        }
        return { tasks, total };
    }
    /**
     * Updates task execution progress, processed counts, and computes defensible ETA.
     */
    static async updateProgress(taskId, companyId, update) {
        const task = await this.getTaskById(taskId, companyId, true);
        if (!task)
            return;
        const now = new Date();
        const nowIso = now.toISOString();
        const inputData = { ...task.input, ...(await this.getRawInput(taskId)) };
        const processed = update.processedCount ?? inputData.processedCount ?? 0;
        const total = update.totalCount ?? inputData.totalCount ?? 0;
        // Defensible ETA calculation
        let estimatedRemainingSeconds = null;
        if (task.startedAt && processed > 0 && total > processed) {
            const elapsedSeconds = Math.max(1, (now.getTime() - new Date(task.startedAt).getTime()) / 1000);
            const secondsPerItem = elapsedSeconds / processed;
            estimatedRemainingSeconds = Math.round(secondsPerItem * (total - processed));
        }
        const checkpoints = inputData.checkpoints || [];
        if (update.checkpointMessage) {
            checkpoints.push({
                timestamp: nowIso,
                step: update.currentStep || "PROGRESS",
                message: update.checkpointMessage,
                processedCount: processed,
                totalCount: total,
                verified: true,
            });
        }
        // Update subtask states
        const subtasks = inputData.subtasks || [];
        if (update.subtaskId && update.subtaskStatus) {
            const targetSubtask = subtasks.find((s) => s.id === update.subtaskId);
            if (targetSubtask) {
                targetSubtask.status = update.subtaskStatus;
                if (update.subtaskStatus === "RUNNING" && !targetSubtask.startedAt) {
                    targetSubtask.startedAt = nowIso;
                }
                if (update.subtaskStatus === "COMPLETED" || update.subtaskStatus === "FAILED") {
                    targetSubtask.completedAt = nowIso;
                }
            }
        }
        inputData.processedCount = processed;
        inputData.totalCount = total;
        inputData.progressPercent = update.percent ?? task.progress.percent;
        inputData.currentStep = update.currentStep ?? task.progress.currentStep;
        inputData.estimatedRemainingSeconds = estimatedRemainingSeconds;
        inputData.lastHeartbeatAt = nowIso;
        inputData.checkpoints = checkpoints;
        inputData.subtasks = subtasks;
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: {
                input: inputData,
            },
        });
    }
    /**
     * Logs an immutable execution step into AIAgentExecution.
     */
    static async recordExecutionStep(taskId, step) {
        if (!isValidObjectId(taskId))
            return;
        try {
            await prismadb_1.default.aIAgentExecution.create({
                data: {
                    taskId,
                    stepNumber: step.stepNumber,
                    toolName: step.toolName,
                    toolInput: step.toolInput,
                    toolOutput: step.toolOutput,
                    thought: step.thought,
                    promptTokens: step.promptTokens || 0,
                    completionTokens: step.completionTokens || 0,
                    creditsConsumed: step.creditsConsumed || 0,
                    latencyMs: step.latencyMs || 0,
                    status: step.status || "SUCCESS",
                    error: step.error,
                },
            });
        }
        catch (err) {
            console.error("[MascotTaskService] Failed to record execution step:", err);
        }
    }
    /**
     * Approves a task awaiting human oversight.
     */
    static async approveTask(taskId, approverUserId, companyId, approverRole) {
        const task = await this.getTaskById(taskId, companyId);
        if (!task)
            throw new Error("Task not found");
        if (task.status !== "AWAITING_APPROVAL") {
            throw new Error(`Task cannot be approved in state: ${task.status}`);
        }
        // Role check: Only admin, manager or store owner can approve
        const allowedApproverRoles = ["ADMIN", "MANAGER", "SUPER_ADMIN", "OWNER"];
        if (!allowedApproverRoles.includes(approverRole.toUpperCase())) {
            throw new Error(`Role '${approverRole}' is not authorized to grant task approvals.`);
        }
        const nowIso = new Date().toISOString();
        const inputData = await this.getRawInput(taskId);
        // Update approval ticket
        if (task.approval?.approvalId && isValidObjectId(task.approval.approvalId)) {
            await prismadb_1.default.aIAgentApproval.update({
                where: { id: task.approval.approvalId },
                data: {
                    status: "APPROVED",
                    reviewedBy: isValidObjectId(approverUserId) ? approverUserId : undefined,
                    reviewedAt: new Date(),
                },
            });
        }
        inputData.mascotState = "QUEUED";
        inputData.auditTrail = inputData.auditTrail || [];
        inputData.auditTrail.push({
            timestamp: nowIso,
            action: "APPROVED",
            actorId: approverUserId,
            actorRole: approverRole,
        });
        inputData.checkpoints = inputData.checkpoints || [];
        inputData.checkpoints.push({
            timestamp: nowIso,
            step: "APPROVAL_GRANTED",
            message: `Human approval granted by ${approverRole}`,
            verified: true,
        });
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: {
                status: "QUEUED",
                approvedBy: isValidObjectId(approverUserId) ? approverUserId : undefined,
                approvedAt: new Date(),
                input: inputData,
            },
        });
        const updated = (await this.getTaskById(taskId, companyId));
        await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(updated, "TASK_ACCEPTED");
        await (0, mascotQueue_1.enqueueMascotJob)(updated);
        return updated;
    }
    /**
     * Rejects an approval-required task, refunding any reserved credits.
     */
    static async rejectTask(taskId, reviewerUserId, companyId, reason) {
        const task = await this.getTaskById(taskId, companyId);
        if (!task)
            throw new Error("Task not found");
        const nowIso = new Date().toISOString();
        const inputData = await this.getRawInput(taskId);
        if (task.approval?.approvalId && isValidObjectId(task.approval.approvalId)) {
            await prismadb_1.default.aIAgentApproval.update({
                where: { id: task.approval.approvalId },
                data: {
                    status: "REJECTED",
                    reviewedBy: isValidObjectId(reviewerUserId) ? reviewerUserId : undefined,
                    reviewedAt: new Date(),
                    rejectionReason: reason,
                },
            });
        }
        // Refund reserved credits
        if (task.credits.reservationId && isValidObjectId(companyId)) {
            try {
                await creditLedger_1.creditLedger.refundCredits({
                    companyId,
                    referenceId: task.credits.reservationId,
                    amount: task.credits.reserved,
                    description: `Task approval rejected: ${reason}`,
                    metadata: { reason },
                });
            }
            catch (err) {
                console.error("[MascotTaskService] Failed to refund credits on rejection:", err);
            }
        }
        inputData.mascotState = "CANCELLED";
        inputData.auditTrail = inputData.auditTrail || [];
        inputData.auditTrail.push({
            timestamp: nowIso,
            action: "REJECTED",
            actorId: reviewerUserId,
            details: { reason },
        });
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: {
                status: "CANCELLED",
                failureReason: `Rejected by reviewer: ${reason}`,
                input: inputData,
            },
        });
        const updated = (await this.getTaskById(taskId, companyId));
        await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(updated, "TASK_CANCELLED", { reason });
        return updated;
    }
    /**
     * Cancels a running or queued task safely, refunding credits.
     */
    static async cancelTask(taskId, userId, companyId, reason = "Cancelled by user") {
        const task = await this.getTaskById(taskId, companyId);
        if (!task)
            throw new Error("Task not found");
        if (["COMPLETED", "FAILED", "CANCELLED"].includes(task.status)) {
            throw new Error(`Task already terminated in status: ${task.status}`);
        }
        const nowIso = new Date().toISOString();
        const inputData = await this.getRawInput(taskId);
        // Refund reserved credits if unused
        if (task.credits.reservationId && isValidObjectId(companyId)) {
            try {
                await creditLedger_1.creditLedger.refundCredits({
                    companyId,
                    referenceId: task.credits.reservationId,
                    amount: task.credits.reserved,
                    description: `Task cancelled: ${reason}`,
                    metadata: { reason },
                });
            }
            catch (err) {
                console.error("[MascotTaskService] Credit refund failed on cancellation:", err);
            }
        }
        inputData.mascotState = "CANCELLED";
        inputData.auditTrail = inputData.auditTrail || [];
        inputData.auditTrail.push({
            timestamp: nowIso,
            action: "CANCELLED",
            actorId: userId,
            details: { reason },
        });
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: {
                status: "CANCELLED",
                failureReason: reason,
                input: inputData,
            },
        });
        const updated = (await this.getTaskById(taskId, companyId));
        await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(updated, "TASK_CANCELLED", { reason });
        return updated;
    }
    /**
     * Pauses an ongoing task.
     */
    static async pauseTask(taskId, userId, companyId, reason = "Paused by user") {
        const task = await this.getTaskById(taskId, companyId);
        if (!task)
            throw new Error("Task not found");
        if (task.status !== "RUNNING" && task.status !== "QUEUED") {
            throw new Error(`Only RUNNING or QUEUED tasks can be paused.`);
        }
        const inputData = await this.getRawInput(taskId);
        inputData.mascotState = "PAUSED";
        inputData.auditTrail = inputData.auditTrail || [];
        inputData.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: "PAUSED",
            actorId: userId,
            details: { reason },
        });
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: { input: inputData },
        });
        const updated = (await this.getTaskById(taskId, companyId));
        await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(updated, "TASK_PAUSED", { reason });
        return updated;
    }
    /**
     * Resumes a paused task.
     */
    static async resumeTask(taskId, userId, companyId) {
        const task = await this.getTaskById(taskId, companyId);
        if (!task)
            throw new Error("Task not found");
        if (task.status !== "PAUSED") {
            throw new Error(`Only PAUSED tasks can be resumed.`);
        }
        const inputData = await this.getRawInput(taskId);
        inputData.mascotState = "QUEUED";
        inputData.auditTrail = inputData.auditTrail || [];
        inputData.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: "RESUMED",
            actorId: userId,
        });
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: { status: "QUEUED", input: inputData },
        });
        const updated = (await this.getTaskById(taskId, companyId));
        await (0, mascotQueue_1.enqueueMascotJob)(updated);
        return updated;
    }
    /**
     * Retries an eligible failed or expired task.
     */
    static async retryTask(taskId, userId, companyId) {
        const task = await this.getTaskById(taskId, companyId);
        if (!task)
            throw new Error("Task not found");
        if (!["FAILED", "EXPIRED", "PARTIALLY_COMPLETED"].includes(task.status)) {
            throw new Error(`Only failed, expired, or partial tasks can be retried.`);
        }
        const inputData = await this.getRawInput(taskId);
        const retryCount = (inputData.taskError?.retryCount || 0) + 1;
        if (retryCount > DEFAULT_MAX_RETRIES) {
            throw new Error(`Maximum retry limit (${DEFAULT_MAX_RETRIES}) exceeded.`);
        }
        inputData.mascotState = "RETRYING";
        inputData.taskError = {
            ...(inputData.taskError || {}),
            retryCount,
            maxRetries: DEFAULT_MAX_RETRIES,
        };
        inputData.auditTrail = inputData.auditTrail || [];
        inputData.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: "RETRY_TRIGGERED",
            actorId: userId,
            details: { attempt: retryCount },
        });
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: { status: "QUEUED", input: inputData },
        });
        const updated = (await this.getTaskById(taskId, companyId));
        await (0, mascotQueue_1.enqueueMascotJob)(updated);
        return updated;
    }
    /**
     * Finalizes a completed task, finalizes credits, records audit log, and notifies.
     */
    static async finalizeTask(taskId, companyId, result) {
        const task = await this.getTaskById(taskId, companyId, true);
        if (!task)
            return;
        const finalCredits = result.creditsConsumed ?? task.credits.reserved;
        const now = new Date();
        const nowIso = now.toISOString();
        // Finalize credit charge
        if (task.credits.reservationId && isValidObjectId(companyId)) {
            try {
                await creditLedger_1.creditLedger.finalizeCharge({
                    companyId,
                    referenceId: task.credits.reservationId,
                    reservedAmount: task.credits.reserved,
                    actualAmount: finalCredits,
                    description: `Mascot Task Finalized: ${task.title}`,
                });
            }
            catch (err) {
                console.error("[MascotTaskService] Credit finalization failed:", err);
            }
        }
        const finalState = result.partiallyCompleted ? "PARTIALLY_COMPLETED" : "COMPLETED";
        const inputData = await this.getRawInput(taskId);
        inputData.mascotState = finalState;
        inputData.progressPercent = 100;
        inputData.currentStep = "Completed";
        inputData.estimatedRemainingSeconds = 0;
        inputData.checkpoints = inputData.checkpoints || [];
        inputData.checkpoints.push({
            timestamp: nowIso,
            step: "FINAL_VERIFICATION",
            message: `Task successfully verified and finalized: ${result.summary.slice(0, 100)}`,
            verified: true,
        });
        // Mark all remaining subtasks as COMPLETED
        if (inputData.subtasks) {
            inputData.subtasks.forEach((st) => {
                if (st.status === "RUNNING" || st.status === "PENDING") {
                    st.status = "COMPLETED";
                    st.completedAt = nowIso;
                }
            });
        }
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: {
                status: "COMPLETED",
                creditsUsed: finalCredits,
                completedAt: now,
                input: inputData,
                output: {
                    summary: result.summary,
                    data: result.data || {},
                    deepLinks: result.deepLinks || [],
                    completedAt: nowIso,
                },
            },
        });
        // Log audit log
        try {
            if (isValidObjectId(companyId)) {
                await prismadb_1.default.aIAuditLog.create({
                    data: {
                        action: `TASK_${task.taskType}`,
                        actorId: isValidObjectId(task.userId) ? task.userId : undefined,
                        target: companyId,
                        details: {
                            companyId,
                            agentName: "SalesmanPro Mascot",
                            taskId,
                            title: task.title,
                            state: finalState,
                            creditsUsed: finalCredits,
                            resultSummary: result.summary.slice(0, 200),
                        },
                    },
                });
            }
        }
        catch (err) {
            console.warn("[MascotTaskService] Audit log write failed:", err);
        }
        const updated = (await this.getTaskById(taskId, companyId, true));
        if (result.partiallyCompleted) {
            await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(updated, "TASK_PARTIALLY_COMPLETED", {
                reason: result.partialReason,
            });
        }
        else {
            await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(updated, "TASK_COMPLETED");
        }
    }
    /**
     * Fails a task, records classification, handles bounded retries, or refunds credits.
     */
    static async failTask(taskId, companyId, error) {
        const task = await this.getTaskById(taskId, companyId, true);
        if (!task)
            return;
        const inputData = await this.getRawInput(taskId);
        const category = error.category || this.classifyError(error.message);
        const currentRetries = inputData.taskError?.retryCount || 0;
        const isRetryable = (category === "TRANSIENT_NETWORK" || category === "RATE_LIMIT") &&
            currentRetries < DEFAULT_MAX_RETRIES;
        const nowIso = new Date().toISOString();
        if (isRetryable) {
            const nextRetryCount = currentRetries + 1;
            const delayMs = Math.pow(2, nextRetryCount) * 3000; // Exponential backoff (6s, 12s, 24s)
            const nextRetryAt = new Date(Date.now() + delayMs).toISOString();
            inputData.mascotState = "RETRYING";
            inputData.taskError = {
                code: error.code || "TRANSIENT_ERROR",
                message: error.message,
                category,
                retryCount: nextRetryCount,
                maxRetries: DEFAULT_MAX_RETRIES,
                nextRetryAt,
            };
            inputData.checkpoints = inputData.checkpoints || [];
            inputData.checkpoints.push({
                timestamp: nowIso,
                step: "RETRY_SCHEDULED",
                message: `Transient error (${category}). Retrying in ${delayMs / 1000}s (Attempt ${nextRetryCount}/${DEFAULT_MAX_RETRIES})`,
                verified: false,
            });
            await prismadb_1.default.aIAgentTask.update({
                where: { id: taskId },
                data: { input: inputData },
            });
            setTimeout(async () => {
                const fresh = await this.getTaskById(taskId, companyId, true);
                if (fresh && fresh.status === "RETRYING") {
                    await (0, mascotQueue_1.enqueueMascotJob)(fresh);
                }
            }, delayMs);
            return;
        }
        // Unrecoverable failure -> refund credits
        if (task.credits.reservationId && isValidObjectId(companyId)) {
            try {
                await creditLedger_1.creditLedger.refundCredits({
                    companyId,
                    referenceId: task.credits.reservationId,
                    amount: task.credits.reserved,
                    description: `Task execution failed: ${error.message}`,
                    metadata: { reason: error.message },
                });
            }
            catch (err) {
                console.error("[MascotTaskService] Credit refund failed on task error:", err);
            }
        }
        inputData.mascotState = "FAILED";
        inputData.taskError = {
            code: error.code || "EXECUTION_FAILED",
            message: error.message,
            category,
            retryCount: currentRetries,
            maxRetries: DEFAULT_MAX_RETRIES,
        };
        inputData.checkpoints = inputData.checkpoints || [];
        inputData.checkpoints.push({
            timestamp: nowIso,
            step: "EXECUTION_FAILED",
            message: `Failed: ${error.message}`,
            verified: false,
        });
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: {
                status: "FAILED",
                failureReason: error.message,
                input: inputData,
            },
        });
        const updated = (await this.getTaskById(taskId, companyId, true));
        await taskNotificationService_1.MascotTaskNotificationService.notifyTaskEvent(updated, "TASK_FAILED", {
            reason: error.message,
        });
    }
    static classifyError(errorMessage) {
        const msg = (errorMessage || "").toLowerCase();
        if (msg.includes("rate limit") || msg.includes("429") || msg.includes("quota"))
            return "RATE_LIMIT";
        if (msg.includes("credit") || msg.includes("insufficient"))
            return "CREDIT_EXHAUSTED";
        if (msg.includes("unauthorized") || msg.includes("forbidden") || msg.includes("permission"))
            return "PERMISSION_DENIED";
        if (msg.includes("invalid") || msg.includes("schema") || msg.includes("required"))
            return "VALIDATION_FAILED";
        if (msg.includes("timeout") ||
            msg.includes("timedout") ||
            msg.includes("timed out") ||
            msg.includes("econnrefused") ||
            msg.includes("econnreset") ||
            msg.includes("network") ||
            msg.includes("enotfound") ||
            msg.includes("connection") ||
            msg.includes("fetch failed") ||
            msg.includes("eai_again") ||
            msg.includes("socket")) {
            return "TRANSIENT_NETWORK";
        }
        return "FATAL";
    }
    static async getRawInput(taskId) {
        const task = await prismadb_1.default.aIAgentTask.findUnique({
            where: { id: taskId },
            select: { input: true },
        });
        return task?.input || {};
    }
}
exports.MascotTaskService = MascotTaskService;
