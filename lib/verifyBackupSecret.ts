// lib/verifyBackupSecret.ts
export function verifyBackupSecret(req: Request) {
  const secret = req.headers.get("x-backup-secret");

  if (!secret || secret !== process.env.BACKUP_SECRET) {
    throw new Error("Unauthorized backup access");
  }
}