"use strict";
/**
 * tests/backup-system.test.ts
 *
 * Automated Test Suite for SalesmanPro Database Backup,
 * Cloud Archive & Disaster Recovery System.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const cryptoPipeline_1 = require("../lib/backup/crypto/cryptoPipeline");
const storageProvider_1 = require("../lib/backup/storage/storageProvider");
const backupEngine_1 = require("../lib/backup/engine/backupEngine");
const restoreEngine_1 = require("../lib/backup/engine/restoreEngine");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function runTests() {
    console.log("===============================================================");
    console.log("🚀 STARTING SALESMANPRO BACKUP & DISASTER RECOVERY TEST SUITE");
    console.log("===============================================================\n");
    let passed = 0;
    let failed = 0;
    async function test(name, fn) {
        process.stdout.write(`⏳ Running test: ${name}... `);
        try {
            await fn();
            console.log("✅ PASSED");
            passed++;
        }
        catch (err) {
            console.log("❌ FAILED");
            console.error(`   Error: ${err.message}`);
            if (err.stack)
                console.error(err.stack);
            failed++;
        }
    }
    // 1. CRYPTO & COMPRESSION PIPELINE TESTS
    await test("Crypto: Encrypt and Compress Sample Payload", async () => {
        const sampleDbPayload = {
            manifest: {
                formatVersion: "2.0",
                platform: "salesmanpro",
                database: "mongodb",
                createdAt: new Date().toISOString(),
                backupType: "MANUAL",
                backupId: "test-backup-123",
            },
            data: {
                Company: [{ id: "comp-1", name: "Acme Corp", createdAt: new Date().toISOString() }],
                User: [{ id: "usr-1", email: "admin@acme.com", name: "Admin" }],
            },
        };
        const plainBuffer = Buffer.from(JSON.stringify(sampleDbPayload), "utf-8");
        const { artifactBuffer, checksum, header } = await (0, cryptoPipeline_1.encryptAndCompressBackup)(plainBuffer);
        (0, assert_1.default)(artifactBuffer.length > 0, "Artifact buffer should not be empty");
        (0, assert_1.default)(checksum.length === 64, "Checksum should be 64-char hex SHA-256");
        (0, assert_1.default)(header.ivHex.length === 24, "IV should be 12-byte hex (24 chars)");
        (0, assert_1.default)(header.authTagHex.length === 32, "Auth tag should be 16-byte hex (32 chars)");
        // Decrypt and decompress
        const { plainBuffer: decrypted, header: decHeader } = await (0, cryptoPipeline_1.decryptAndDecompressBackup)(artifactBuffer, checksum);
        assert_1.default.strictEqual(decrypted.toString("utf-8"), plainBuffer.toString("utf-8"));
        assert_1.default.strictEqual(decHeader.version, header.version);
    });
    await test("Crypto: Reject Corrupted Artifact or Mismatched Checksum", async () => {
        const plainBuffer = Buffer.from("Sensitive SalesmanPro Platform Data", "utf-8");
        const { artifactBuffer, checksum } = await (0, cryptoPipeline_1.encryptAndCompressBackup)(plainBuffer);
        // Tamper with checksum
        await assert_1.default.rejects(async () => {
            await (0, cryptoPipeline_1.decryptAndDecompressBackup)(artifactBuffer, "wrong-sha256-checksum-000000000000000000000000000000000000000000000000");
        }, /Artifact checksum mismatch/, "Should reject tampered checksum");
        // Tamper with encrypted bytes
        const tampered = Buffer.from(artifactBuffer);
        tampered[tampered.length - 5] ^= 0xff;
        await assert_1.default.rejects(async () => {
            await (0, cryptoPipeline_1.decryptAndDecompressBackup)(tampered);
        }, /Decryption failed/, "Should reject tampered ciphertext with auth tag failure");
    });
    // 2. STORAGE ABSTRACTION TESTS
    await test("Storage: Local Storage Provider Upload, Exists, and Download", async () => {
        const testDir = path_1.default.join(process.cwd(), "scratch", "test-storage");
        const storage = new storageProvider_1.LocalBackupStorageProvider(testDir);
        const testKey = "backups/test/2026/09/04/backup-test-1.dump.gz.enc";
        const testContent = Buffer.from("Mock encrypted backup artifact content", "utf-8");
        const uploadRes = await storage.upload(testKey, testContent, { test: "true" });
        assert_1.default.strictEqual(uploadRes.sizeBytes, testContent.length);
        const exists = await storage.exists(testKey);
        assert_1.default.strictEqual(exists, true, "Uploaded file should exist");
        const metadata = await storage.getMetadata(testKey);
        assert_1.default.strictEqual(metadata.sizeBytes, testContent.length);
        assert_1.default.strictEqual(metadata.customMetadata?.test, "true");
        const downloadStream = await storage.download(testKey);
        const chunks = [];
        for await (const chunk of downloadStream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        assert_1.default.strictEqual(Buffer.concat(chunks).toString("utf-8"), testContent.toString("utf-8"));
        // Clean up
        await storage.delete(testKey);
        const existsAfterDelete = await storage.exists(testKey);
        assert_1.default.strictEqual(existsAfterDelete, false);
        if (fs_1.default.existsSync(testDir)) {
            fs_1.default.rmSync(testDir, { recursive: true, force: true });
        }
    });
    await test("Storage: Key Builder Format Validation", async () => {
        const key = (0, storageProvider_1.buildBackupStorageKey)("abc12345", "DAILY", new Date("2026-09-04T02:00:00Z"));
        (0, assert_1.default)(key.includes("/daily/2026/09/04/backup-abc12345.dump.gz.enc"), `Invalid key format: ${key}`);
    });
    // 3. MODEL SANITIZATION & DEPENDENCY ORDERING TESTS
    await test("Engine: Sanitize Record Strips Non-Scalar Relational Objects", async () => {
        const mockModelMeta = {
            fields: [
                { name: "id", kind: "scalar", type: "String" },
                { name: "name", kind: "scalar", type: "String" },
                { name: "amount", kind: "scalar", type: "Float" },
                { name: "createdAt", kind: "scalar", type: "DateTime" },
                { name: "user", kind: "object", type: "User" },
                { name: "orders", kind: "object", type: "Order" }, // Relation array!
            ],
        };
        const dirtyRecord = {
            id: "ord-123",
            name: "Standard Package",
            amount: 1500.5,
            createdAt: new Date("2026-09-01T12:00:00Z"),
            user: { id: "usr-99", email: "nested@example.com" },
            orders: [{ id: "sub-1" }],
        };
        const sanitized = backupEngine_1.backupEngine.sanitizeRecord(dirtyRecord, mockModelMeta);
        assert_1.default.strictEqual(sanitized.id, "ord-123");
        assert_1.default.strictEqual(sanitized.name, "Standard Package");
        assert_1.default.strictEqual(sanitized.amount, 1500.5);
        assert_1.default.strictEqual(sanitized.createdAt, "2026-09-01T12:00:00.000Z");
        assert_1.default.strictEqual(sanitized.user, undefined, "Relation object 'user' must be stripped");
        assert_1.default.strictEqual(sanitized.orders, undefined, "Relation object 'orders' must be stripped");
    });
    await test("Engine: Dependency Ordering Prioritizes Core Entities", async () => {
        const unorderedModels = [
            "OrderItem",
            "Payment",
            "Company",
            "User",
            "Product",
            "WhatsAppSession",
            "CustomAttribute",
        ];
        const ordered = restoreEngine_1.restoreEngine.sortModelsByDependency(unorderedModels);
        const compIndex = ordered.indexOf("Company");
        const userIndex = ordered.indexOf("User");
        const prodIndex = ordered.indexOf("Product");
        const orderItemIndex = ordered.indexOf("OrderItem");
        const paymentIndex = ordered.indexOf("Payment");
        (0, assert_1.default)(compIndex < prodIndex, "Company must precede Product");
        (0, assert_1.default)(userIndex < prodIndex, "User must precede Product");
        (0, assert_1.default)(prodIndex < orderItemIndex, "Product must precede OrderItem");
        (0, assert_1.default)(compIndex < paymentIndex, "Company must precede Payment");
    });
    console.log("\n===============================================================");
    console.log(`🏁 TEST SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
    console.log("===============================================================");
    if (failed > 0) {
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}
runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
