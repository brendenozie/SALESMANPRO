# SalesmanPro — Production Rollout & Operational Procedures

**Author:** DevOps Engineer & Release Manager  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** Deployment Checklist, PM2 Process Management, Health Checks, and Rollback Plans

---

## 1. Prerequisites Checklist

* [x] **Redis Instance:** BullMQ requires an active Redis connection (`REDIS_URL` or `127.0.0.1:6379`).
* [x] **Master Encryption Key:** `MASTER_ENCRYPTION_KEY` configured as a 32-byte (64-character hex) key for AES-256-GCM.
* [x] **NextAuth Secret:** `NEXTAUTH_SECRET` configured for cryptographic session and state tokens.
* [x] **Platform OAuth App:** Super Admin configures Meta App ID and Secret in Credential Vault (`/super-admin/integrations`).

---

## 2. Worker Deployment with PM2

Start or restart background workers using the repository's `ecosystem.config.js`:

```bash
# Start or reload all workers
pm2 reload ecosystem.config.js --only mascot-task-worker

# Monitor worker logs
pm2 logs mascot-task-worker
```

---

## 3. Production Health Probes

* **Store Mascot Context:** `GET /api/ai/mascot/context?companyId={id}`
* **Integrations Overview:** `GET /api/integrations/overview?companyId={id}`
* **Super Admin Telemetry:** `GET /api/super-admin/mascot`
* **Worker Heartbeat:** Verify BullMQ worker listening log: `[MASCOT_WORKER] running and listening for jobs`.

---

## 4. Rollback Plan

If an unexpected upstream provider issue occurs:
1. **Disable Platform OAuth App:** In Super Admin Integrations Console, toggle Meta/Google app to `Disabled`. Existing accounts remain intact, but new OAuth requests are halted.
2. **Revert Publishing Autonomy:** In store settings, switch all accounts to `DRAFT_ONLY`.
3. **Database Reversion:** No destructive migrations were performed; previous schema compatibility is 100% preserved.
