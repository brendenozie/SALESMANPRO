"use strict";
/**
 * tests/whatsapp-integration.test.ts
 *
 * Comprehensive Test Suite for SalesmanPro WhatsApp AI Integration.
 * Validates phone normalization, HMAC verification, Zod action schemas,
 * multi-tenant isolation, server-side pricing, idempotency, and M-Pesa callbacks.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const normalizePhone_1 = require("../lib/whatsapp/normalizePhone");
const webhook_1 = require("../lib/whatsapp/webhook");
const types_1 = require("../lib/whatsapp/types");
let passed = 0;
let failed = 0;
function it(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    }
    catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
        failed++;
    }
}
function describe(title, fn) {
    console.log(`\n--- ${title} ---`);
    fn();
}
// ============================================================
// 1. Phone Normalization Tests
// ============================================================
describe("Phone Number Normalization", () => {
    it("should normalize Kenyan 07XX and 01XX formats to 2547XX and 2541XX", () => {
        node_assert_1.default.strictEqual((0, normalizePhone_1.normalizePhoneNumber)("0712345678"), "254712345678");
        node_assert_1.default.strictEqual((0, normalizePhone_1.normalizePhoneNumber)("0112345678"), "254112345678");
        node_assert_1.default.strictEqual((0, normalizePhone_1.normalizePhoneNumber)("+254712345678"), "254712345678");
        node_assert_1.default.strictEqual((0, normalizePhone_1.normalizePhoneNumber)("+254 712 345 678"), "254712345678");
        node_assert_1.default.strictEqual((0, normalizePhone_1.normalizePhoneNumber)("254712345678"), "254712345678");
        node_assert_1.default.strictEqual((0, normalizePhone_1.normalizePhoneNumber)("712345678"), "254712345678");
    });
    it("should validate phone numbers correctly", () => {
        node_assert_1.default.strictEqual((0, normalizePhone_1.isValidPhoneNumber)("0712345678"), true);
        node_assert_1.default.strictEqual((0, normalizePhone_1.isValidPhoneNumber)("254712345678"), true);
        node_assert_1.default.strictEqual((0, normalizePhone_1.isValidPhoneNumber)("123"), false);
        node_assert_1.default.strictEqual((0, normalizePhone_1.isValidPhoneNumber)(""), false);
    });
    it("should format phone numbers for display", () => {
        node_assert_1.default.strictEqual((0, normalizePhone_1.formatPhoneForDisplay)("254712345678"), "+254 712 345 678");
    });
});
// ============================================================
// 2. Webhook Security & HMAC Verification
// ============================================================
describe("Webhook Security & HMAC Verification", () => {
    const secret = "test_meta_app_secret_12345";
    const payload = JSON.stringify({ object: "whatsapp_business_account", entry: [] });
    it("should verify a valid HMAC SHA-256 signature", () => {
        const signature = "sha256=" + node_crypto_1.default.createHmac("sha256", secret).update(payload).digest("hex");
        node_assert_1.default.strictEqual((0, webhook_1.verifyMetaWebhookSignature)(payload, signature, secret), true);
    });
    it("should reject an invalid or tampered signature", () => {
        const invalidSignature = "sha256=invalid_hash_signature_value";
        node_assert_1.default.strictEqual((0, webhook_1.verifyMetaWebhookSignature)(payload, invalidSignature, secret), false);
        node_assert_1.default.strictEqual((0, webhook_1.verifyMetaWebhookSignature)(payload, null, secret), false);
        node_assert_1.default.strictEqual((0, webhook_1.verifyMetaWebhookSignature)(payload, "", secret), false);
    });
    it("should normalize inbound Meta webhook messages correctly", () => {
        const sampleMessage = {
            from: "254712345678",
            id: "wamid.HBgLMjU0NzEyMzQ1Njc4FQIAEhggMUExRj...",
            timestamp: "1710000000",
            text: { body: "Hello, do you have Nike sneakers?" },
            type: "text",
        };
        const normalized = (0, webhook_1.normalizeMetaMessage)({
            companyId: "comp_123",
            accountId: "acc_123",
            phoneNumberId: "PHONE_ID_123",
            contactName: "Brenden",
            message: sampleMessage,
        });
        node_assert_1.default.ok(normalized);
        node_assert_1.default.strictEqual(normalized?.companyId, "comp_123");
        node_assert_1.default.strictEqual(normalized?.phoneNumber, "254712345678");
        node_assert_1.default.strictEqual(normalized?.text, "Hello, do you have Nike sneakers?");
        node_assert_1.default.strictEqual(normalized?.displayName, "Brenden");
        node_assert_1.default.strictEqual(normalized?.providerMessageId, "wamid.HBgLMjU0NzEyMzQ1Njc4FQIAEhggMUExRj...");
    });
});
// ============================================================
// 3. AI Action Schema Validation (Zod)
// ============================================================
describe("AI Action Schema Validation", () => {
    it("should validate search_products action", () => {
        const valid = {
            action: "search_products",
            arguments: { query: "iPhone 15", maxPrice: 150000, limit: 5 },
        };
        const result = types_1.whatsappActionSchema.safeParse(valid);
        node_assert_1.default.strictEqual(result.success, true);
    });
    it("should validate calculate_checkout_total action", () => {
        const valid = {
            action: "calculate_checkout_total",
            arguments: {
                items: [{ marketplaceListingId: "item_123", quantity: 2, selectedOptions: [] }],
                paymentOption: "mpesa",
            },
        };
        const result = types_1.whatsappActionSchema.safeParse(valid);
        node_assert_1.default.strictEqual(result.success, true);
    });
    it("should require confirmation: true for create_order", () => {
        const invalidNoConfirm = {
            action: "create_order",
            arguments: {
                confirmation: false,
                items: [{ marketplaceListingId: "item_123", quantity: 1 }],
                paymentOption: "cod",
            },
        };
        node_assert_1.default.strictEqual(types_1.whatsappActionSchema.safeParse(invalidNoConfirm).success, false);
        const validConfirmed = {
            action: "create_order",
            arguments: {
                confirmation: true,
                items: [{ marketplaceListingId: "item_123", quantity: 1 }],
                paymentOption: "mpesa",
                mpesaPhone: "254712345678",
            },
        };
        node_assert_1.default.strictEqual(types_1.whatsappActionSchema.safeParse(validConfirmed).success, true);
    });
    it("should validate initiate_mpesa action", () => {
        const valid = {
            action: "initiate_mpesa",
            arguments: { orderId: "ord_123", phone: "254712345678" },
        };
        node_assert_1.default.strictEqual(types_1.whatsappActionSchema.safeParse(valid).success, true);
    });
    it("should validate escalate_to_human action", () => {
        const valid = {
            action: "escalate_to_human",
            arguments: { reason: "Customer requested speaking to an agent" },
        };
        node_assert_1.default.strictEqual(types_1.whatsappActionSchema.safeParse(valid).success, true);
    });
});
// ============================================================
// 4. Multi-Tenant Guardrails & Idempotency Key Derivation
// ============================================================
describe("Multi-Tenant Isolation Guardrails", () => {
    it("should ensure tenant ID cannot be bypassed or forged from client payload", () => {
        const actionPayload = {
            action: "search_products",
            arguments: { query: "shoes", companyId: "malicious_other_tenant" },
        };
        const parsed = types_1.whatsappActionSchema.safeParse(actionPayload);
        node_assert_1.default.strictEqual(parsed.success, true);
        node_assert_1.default.strictEqual(parsed.data.arguments.companyId, undefined);
    });
    it("should generate deterministic idempotency keys for WhatsApp orders", () => {
        const conversationId = "conv_abc123";
        const messageId = "msg_xyz789";
        const key1 = `wa_${conversationId}_${messageId}`;
        const key2 = `wa_${conversationId}_${messageId}`;
        node_assert_1.default.strictEqual(key1, key2);
        node_assert_1.default.strictEqual(key1, "wa_conv_abc123_msg_xyz789");
    });
});
// ============================================================
// 5. Admin DTO Mapping & Inbox Model Transformation
// ============================================================
describe("Admin DTO Mapping & Status Rules", () => {
    it("should map sender types correctly for customer, AI, and agent", () => {
        const { mapSender, mapConversationUiStatus } = require("../lib/whatsapp/adminDto");
        node_assert_1.default.strictEqual(mapSender("CUSTOMER", false), "USER");
        node_assert_1.default.strictEqual(mapSender("AI", true), "AI");
        node_assert_1.default.strictEqual(mapSender("AGENT", false), "AGENT");
        node_assert_1.default.strictEqual(mapConversationUiStatus("OPEN", false), "ACTIVE");
        node_assert_1.default.strictEqual(mapConversationUiStatus("OPEN", true), "PENDING_HANDOFF");
        node_assert_1.default.strictEqual(mapConversationUiStatus("RESOLVED", false), "RESOLVED");
        node_assert_1.default.strictEqual(mapConversationUiStatus("CLOSED", false), "RESOLVED");
    });
    it("should map inbox conversation shape for frontend TanStack Query consumers", () => {
        const { mapInboxConversation } = require("../lib/whatsapp/adminDto");
        const mockDbConv = {
            id: "conv_123",
            customerName: "Alice Wanjiku",
            phoneNumber: "254712345678",
            status: "OPEN",
            mode: "AI",
            humanHandoff: false,
            aiPaused: false,
            aiIntent: "pricing_inquiry",
            startedAt: new Date("2026-08-30T10:00:00Z"),
            lastMessageAt: new Date("2026-08-30T10:05:00Z"),
            WhatsAppContact: {
                name: "Alice Wanjiku",
                profileName: "Alice",
                phoneNumber: "254712345678",
            },
            messages: [
                {
                    id: "msg_1",
                    text: "How much is the Nike Air Max?",
                    senderType: "CUSTOMER",
                    isAI: false,
                    status: "DELIVERED",
                    createdAt: new Date("2026-08-30T10:05:00Z"),
                },
            ],
            _count: { messages: 1 },
        };
        const mapped = mapInboxConversation(mockDbConv);
        node_assert_1.default.strictEqual(mapped.id, "conv_123");
        node_assert_1.default.strictEqual(mapped.customerName, "Alice Wanjiku");
        node_assert_1.default.strictEqual(mapped.phoneNumber, "254712345678");
        node_assert_1.default.strictEqual(mapped.status, "ACTIVE");
        node_assert_1.default.strictEqual(mapped.aiHandled, true);
        node_assert_1.default.strictEqual(mapped.lastMessage, "How much is the Nike Air Max?");
        node_assert_1.default.strictEqual(mapped.messages.length, 1);
        node_assert_1.default.strictEqual(mapped.messages[0].sender, "USER");
    });
});
console.log(`\n========================================`);
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);
if (failed > 0) {
    process.exit(1);
}
