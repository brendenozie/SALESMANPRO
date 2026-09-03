"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBackupSecret = void 0;
// lib/verifyBackupSecret.ts
function verifyBackupSecret(req) {
    const secret = req.headers.get("x-backup-secret");
    if (!secret || secret !== process.env.BACKUP_SECRET) {
        throw new Error("Unauthorized backup access");
    }
}
exports.verifyBackupSecret = verifyBackupSecret;
