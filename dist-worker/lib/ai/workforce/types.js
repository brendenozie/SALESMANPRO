"use strict";
/**
 * lib/ai/workforce/types.ts
 *
 * Core TypeScript contracts for the SalesmanPro + Ghuba 3-Tier AI Agent Workforce.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProspectStatus = exports.AgentMemoryScope = exports.AgentApprovalStatus = exports.AgentTaskStatus = exports.AgentPermissionLevel = exports.AgentWorkforceLevel = void 0;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "AgentWorkforceLevel", { enumerable: true, get: function () { return client_1.AgentWorkforceLevel; } });
Object.defineProperty(exports, "AgentPermissionLevel", { enumerable: true, get: function () { return client_1.AgentPermissionLevel; } });
Object.defineProperty(exports, "AgentTaskStatus", { enumerable: true, get: function () { return client_1.AgentTaskStatus; } });
Object.defineProperty(exports, "AgentApprovalStatus", { enumerable: true, get: function () { return client_1.AgentApprovalStatus; } });
Object.defineProperty(exports, "AgentMemoryScope", { enumerable: true, get: function () { return client_1.AgentMemoryScope; } });
Object.defineProperty(exports, "ProspectStatus", { enumerable: true, get: function () { return client_1.ProspectStatus; } });
