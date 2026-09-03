"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResponse = void 0;
// -----------------------------
// Shared Helpers
const server_1 = require("next/server");
const formatResponse = (success, data, error, status = 200) => server_1.NextResponse.json({ success, data, error }, { status });
exports.formatResponse = formatResponse;
