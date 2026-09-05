"use strict";
/**
 * lib/ai/workforce/orchestrator.ts
 *
 * Central Autonomous Orchestration Engine for the 3-Tier AI Workforce.
 * Features:
 * - Durable task state machine (QUEUED -> RUNNING -> WAITING_APPROVAL -> COMPLETED / FAILED)
 * - Safe bounded reasoning loop (Max 4 steps, recursion protection, timeout guard)
 * - Human-in-the-loop approval interception
 * - Immutable execution trace logging (AIAgentExecution)
 * - Authoritative credit reservation and settlement
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workforceOrchestrator = exports.WorkforceOrchestrator = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const aiService_1 = require("@/lib/ai/aiService");
const agentRegistry_1 = require("./agentRegistry");
const toolRegistry_1 = require("./toolRegistry");
const creditPolicy_1 = require("./creditPolicy");
const memoryManager_1 = require("./memoryManager");
const promptDefense_1 = require("./promptDefense");
const types_1 = require("./types");
const types_2 = require("@/lib/ai/types");
class WorkforceOrchestrator {
    /**
     * Executes an autonomous or assisted agent task with complete auditability.
     */
    async execute(input, context) {
        const startTime = Date.now();
        const agentDef = agentRegistry_1.WorkforceAgentRegistry.getAgent(input.agentKey);
        if (!agentDef) {
            throw new types_2.AIPlatformError("AGENT_NOT_FOUND", `Agent '${input.agentKey}' is not registered.`, 404);
        }
        // 1. Find or create AIAgent database record
        const agentRecord = await this.resolveAgentRecord(input.agentKey, context);
        if (!agentRecord.enabled) {
            throw new types_2.AIPlatformError("AGENT_DISABLED", `Agent '${agentDef.name}' is currently disabled for this account.`, 400);
        }
        // 2. Create durable AIAgentTask record
        const task = await prismadb_1.default.aIAgentTask.create({
            data: {
                agentId: agentRecord.id,
                companyId: context.companyId || undefined,
                userId: context.userId || undefined,
                taskType: `RUN_${input.agentKey}`,
                title: input.prompt.slice(0, 100),
                priority: input.priority || 2,
                status: types_1.AgentTaskStatus.RUNNING,
                input: { prompt: input.prompt, contextOverrides: input.contextOverrides },
                startedAt: new Date(),
            },
        });
        context.taskId = task.id;
        // 3. Reserve credit budget
        const estimatedBaseCredits = 2.0;
        const { reservationId } = await creditPolicy_1.WorkforceCreditPolicy.reserveBudget(context, estimatedBaseCredits, `Agent Run: ${agentDef.name}`);
        const toolCallsExecuted = [];
        let totalCreditsConsumed = 0;
        let finalReply = "";
        let status = types_1.AgentTaskStatus.COMPLETED;
        let approvalId;
        let escalationId;
        try {
            // 4. Retrieve available tools for this agent
            const availableTools = toolRegistry_1.WorkforceToolRegistry.listToolsForAgent(agentDef.level, agentRecord.permissionLevel, agentRecord.allowedTools);
            // 5. Retrieve partitioned memory
            const memories = await memoryManager_1.WorkforceMemoryManager.getMemories({
                context,
                limit: 3,
            });
            const memoryContext = memories.length > 0
                ? `\nRelevant Store & Agent Memory:\n${memories.map((m) => `- [${m.scope}] ${m.key}: ${m.content}`).join("\n")}\n`
                : "";
            // 6. Construct prompt with defense boundaries
            const toolDocs = availableTools.map((t) => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters,
                requiresApproval: t.requiresApproval || false,
            }));
            const baseSystemPrompt = `${agentDef.systemPrompt}
${memoryContext}
You have access to the following bounded tools:
${JSON.stringify(toolDocs, null, 2)}

Workflow Instructions:
1. Analyze the user request.
2. If you need information from store products, orders, inventory, or platform metrics, execute an available tool.
3. To execute a tool, respond strictly in JSON with:
{
  "thought": "Your internal reasoning",
  "action": "toolName",
  "actionInput": { ...tool parameters }
}
4. When you have sufficient data to answer the user completely, respond in JSON with:
{
  "thought": "Your internal reasoning",
  "finalResponse": "Your comprehensive, professional markdown reply to the user."
}
5. Always ground your final response in actual verified data returned by tools.`;
            const securedSystemPrompt = promptDefense_1.PromptDefense.injectSecurityBoundaries(baseSystemPrompt);
            // 7. Reasoning Loop (Max steps bound)
            const maxSteps = Math.min(input.maxSteps || 4, 6);
            let currentStep = 1;
            let isFinished = false;
            const conversationHistory = [...(input.conversationHistory || [])];
            // Add user prompt quarantined as data
            const quarantinedPrompt = promptDefense_1.PromptDefense.wrapUntrustedData(input.prompt, "user_request");
            let currentPrompt = quarantinedPrompt;
            while (currentStep <= maxSteps && !isFinished) {
                const stepStartTime = Date.now();
                const response = await aiService_1.aiService.generateText({
                    prompt: currentPrompt,
                    systemPrompt: securedSystemPrompt,
                    conversationHistory,
                    modelId: input.modelId,
                    jsonSchema: true,
                }, {
                    companyId: context.companyId || "PLATFORM_SUPER_ADMIN",
                    userId: context.userId,
                    source: context.source || "AGENT",
                    feature: `workforce_${input.agentKey.toLowerCase()}`,
                });
                totalCreditsConsumed += response.creditsConsumed;
                const parsed = response.json;
                // Check if agent provided finalResponse
                if (parsed?.finalResponse) {
                    finalReply = parsed.finalResponse;
                    isFinished = true;
                    await prismadb_1.default.aIAgentExecution.create({
                        data: {
                            taskId: task.id,
                            stepNumber: currentStep,
                            thought: parsed.thought || "Final answer formulated",
                            promptTokens: response.promptTokens,
                            completionTokens: response.completionTokens,
                            creditsConsumed: response.creditsConsumed,
                            latencyMs: Date.now() - stepStartTime,
                            model: response.model,
                            status: "SUCCESS",
                        },
                    });
                    break;
                }
                // Check if agent invoked a tool
                if (parsed?.action) {
                    const toolName = parsed.action;
                    const toolArgs = parsed.actionInput || {};
                    // Execute tool via Registry
                    const toolResult = await toolRegistry_1.WorkforceToolRegistry.executeTool(toolName, toolArgs, context);
                    // Handle Approval Requirement
                    if (toolResult.requiresApproval && toolResult.approvalPayload) {
                        const approval = await prismadb_1.default.aIAgentApproval.create({
                            data: {
                                agentId: agentRecord.id,
                                taskId: task.id,
                                companyId: context.companyId || undefined,
                                actionType: toolResult.approvalPayload.actionType,
                                title: toolResult.approvalPayload.title,
                                description: toolResult.approvalPayload.description,
                                proposedAction: toolResult.approvalPayload.proposedAction,
                                status: types_1.AgentApprovalStatus.PENDING,
                            },
                        });
                        approvalId = approval.id;
                        status = types_1.AgentTaskStatus.WAITING_APPROVAL;
                        isFinished = true;
                        finalReply = `Action '${toolName}' requires authorization. An approval request has been queued in your Approvals inbox (ID: ${approval.id}).`;
                        await prismadb_1.default.aIAgentExecution.create({
                            data: {
                                taskId: task.id,
                                stepNumber: currentStep,
                                toolName,
                                toolInput: toolArgs,
                                toolOutput: { approvalId: approval.id, status: "WAITING_APPROVAL" },
                                thought: parsed.thought,
                                creditsConsumed: response.creditsConsumed,
                                latencyMs: Date.now() - stepStartTime,
                                status: "APPROVAL_PENDING",
                            },
                        });
                        break;
                    }
                    // Tool executed
                    const toolLatency = Date.now() - stepStartTime;
                    toolCallsExecuted.push({
                        toolName,
                        input: toolArgs,
                        output: toolResult.data || toolResult.error,
                        status: toolResult.success ? "SUCCESS" : "ERROR",
                        latencyMs: toolLatency,
                    });
                    await prismadb_1.default.aIAgentExecution.create({
                        data: {
                            taskId: task.id,
                            stepNumber: currentStep,
                            toolName,
                            toolInput: toolArgs,
                            toolOutput: toolResult.data || { error: toolResult.error },
                            thought: parsed.thought,
                            promptTokens: response.promptTokens,
                            completionTokens: response.completionTokens,
                            creditsConsumed: response.creditsConsumed,
                            latencyMs: toolLatency,
                            model: response.model,
                            status: toolResult.success ? "SUCCESS" : "ERROR",
                            error: toolResult.error,
                        },
                    });
                    // Feed tool summary back into conversation for next step
                    currentPrompt = `Tool '${toolName}' execution result:\n${toolResult.summaryForAgent || JSON.stringify(toolResult.data || toolResult.error)}\n\nPlease now formulate your final response or take the next necessary step.`;
                    conversationHistory.push({
                        role: "assistant",
                        content: JSON.stringify(parsed),
                    });
                    conversationHistory.push({
                        role: "user",
                        content: currentPrompt,
                    });
                    currentStep++;
                }
                else {
                    // If neither structured action nor finalResponse, use raw text as fallback
                    finalReply = response.text || "Task completed.";
                    isFinished = true;
                }
            }
            // If loop exhausted without explicit final response
            if (!finalReply) {
                finalReply = "Agent finished reasoning steps with available data.";
            }
            // 8. Settle credits
            await creditPolicy_1.WorkforceCreditPolicy.settleBudget({
                context,
                reservationId,
                actualCredits: totalCreditsConsumed,
                description: `Agent ${agentDef.name} Task: ${task.title.slice(0, 50)}`,
            });
            // 9. Update task record to COMPLETED or WAITING_APPROVAL
            await prismadb_1.default.aIAgentTask.update({
                where: { id: task.id },
                data: {
                    status,
                    output: { reply: finalReply, approvalId, escalationId },
                    toolCalls: toolCallsExecuted,
                    creditsUsed: totalCreditsConsumed,
                    completedAt: new Date(),
                },
            });
            // Update agent activity timestamp
            await prismadb_1.default.aIAgent.update({
                where: { id: agentRecord.id },
                data: {
                    lastActiveAt: new Date(),
                    creditsUsedToday: { increment: totalCreditsConsumed },
                },
            });
            return {
                taskId: task.id,
                agentKey: input.agentKey,
                status,
                reply: finalReply,
                toolCallsExecuted,
                creditsConsumed: totalCreditsConsumed,
                creditsUsed: totalCreditsConsumed,
                stepsExecuted: toolCallsExecuted.length,
                latencyMs: Date.now() - startTime,
                requiresApproval: status === types_1.AgentTaskStatus.WAITING_APPROVAL,
                approvalId,
                escalationId,
            };
        }
        catch (error) {
            console.error(`[WORKFORCE_ORCHESTRATOR_ERROR: ${input.agentKey}]`, error);
            // Release reserved credits
            await creditPolicy_1.WorkforceCreditPolicy.releaseBudget({
                context,
                reservationId,
                reason: error.message || "Task failed",
            });
            // Mark task as FAILED
            await prismadb_1.default.aIAgentTask.update({
                where: { id: task.id },
                data: {
                    status: types_1.AgentTaskStatus.FAILED,
                    failureReason: error.message || "Unknown error",
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }
    /**
     * Helper to ensure an AIAgent record exists in database.
     */
    async resolveAgentRecord(agentKey, context) {
        const agentDef = agentRegistry_1.WorkforceAgentRegistry.getAgent(agentKey);
        // Look for existing agent record for this store or platform
        let record = await prismadb_1.default.aIAgent.findFirst({
            where: {
                agentKey,
                companyId: context.level === types_1.AgentWorkforceLevel.STORE ? context.companyId : null,
            },
        });
        if (!record) {
            record = await prismadb_1.default.aIAgent.create({
                data: {
                    agentKey,
                    name: agentDef.name,
                    description: agentDef.roleDescription,
                    level: agentDef.level,
                    companyId: context.level === types_1.AgentWorkforceLevel.STORE ? context.companyId : undefined,
                    enabled: true,
                    permissionLevel: agentDef.defaultPermission,
                    allowedTools: agentDef.allowedTools,
                    allowedChannels: agentDef.allowedChannels,
                    systemPrompt: agentDef.systemPrompt,
                    dailyCreditLimit: agentDef.defaultDailyCreditLimit,
                },
            });
        }
        return record;
    }
}
exports.WorkforceOrchestrator = WorkforceOrchestrator;
exports.workforceOrchestrator = new WorkforceOrchestrator();
