# SalesmanPro — Marketing Agent Integration

**Author:** AI Agent Specialist & Marketing Systems Engineer  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** Autonomous Product Promotion, Social Account Publishing, Publishing Modes, and Failure Recovery

---

## 1. Overview

Once a store's Facebook Page or Instagram Professional account is connected and verified, the Marketing Agent can autonomously generate, schedule, and publish product promotions derived directly from the store's authoritative product catalog.

---

## 2. Configurable Publishing Modes

Store owners can configure their desired level of mascot autonomy in **Mascot Settings**:

1. **`DRAFT_ONLY`:** The agent creates marketing copy, hashtags, and media previews, saving them in `SocialMediaPost` as drafts. No external API publication occurs.
2. **`APPROVAL_REQUIRED` (Default):** The agent drafts the post and generates an `AIAgentApproval` ticket. Publication only proceeds when a store admin approves.
3. **`PREAPPROVED`:** The agent publishes automatically for catalog items that satisfy predefined boundaries (e.g. products with >10 in stock, max 1 post per day, approved promotional templates).
4. **`MANUAL`:** The agent provides content suggestions upon conversational request; the user manually copies or schedules them.

---

## 3. Failure Recovery & Error Diagnostics

If a publishing attempt fails (e.g. expired Meta token, deleted image, rate limit):
1. The post status transitions to `FAILED` with provider error details recorded in `failureReason`.
2. Reserved AI credits are refunded immediately via `creditLedger.refundCredits()`.
3. A notification with severity `WARNING` is sent to the store administrator with a direct link to reauthorize the connection or edit the post.
