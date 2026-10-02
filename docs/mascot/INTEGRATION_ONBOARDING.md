# SalesmanPro — Mascot-Led Integration Onboarding Guide

**Author:** Senior Full-Stack Engineer & AI Integration Specialist  
**Date:** October 2026  
**Status:** Official Integration Reference  
**Scope:** Conversational Onboarding, Official OAuth Flows, Supported Services, Verification & Reconnection

---

## 1. Overview

The SalesmanPro Mascot transforms complex external API setup into a straightforward, conversational process suitable for non-technical store owners. Users can trigger onboarding using natural language:

* *"Connect my Facebook page"*
* *"Help me connect Instagram to my store"*
* *"Set up WhatsApp so customers can place orders"*
* *"Connect my Google account"*
* *"Show me which accounts still need connecting"*
* *"Why is my Facebook connection not working?"*

---

## 2. Supported Integrations

### 2.1 Facebook Pages (`facebook`)
* **Category:** Social Media
* **Official Flow:** Meta OAuth 2.0 Dialog (`pages_show_list`, `pages_read_engagement`, `pages_manage_posts`).
* **Onboarding Steps:**
  1. Mascot explains what connecting enables (product promotions, post scheduling).
  2. Mascot presents the official Meta authorization screen link.
  3. Store owner signs in to Facebook and selects their managed business Page.
  4. Returns to `/api/integrations/oauth/facebook/callback`.
  5. Tokens are exchanged for 60-day long-lived tokens and encrypted with AES-256-GCM.
  6. Mascot executes a read-only probe (`GET /v20.0/{pageId}`) and reports active status.

### 2.2 Instagram Professional (`instagram`)
* **Category:** Social Media
* **Official Flow:** Meta Graph API linked via Facebook Page (`instagram_basic`, `instagram_content_publish`).
* **Prerequisites:** Instagram Business or Creator account connected to the store's Facebook Page.
* **Onboarding Steps:**
  1. Mascot checks if Facebook Page has a linked `instagram_business_account`.
  2. If missing, mascot instructs the user on converting their personal Instagram to Professional and linking it to their Facebook Page.
  3. Authorizes and records `SocialAccount` with platform `INSTAGRAM`.

### 2.3 WhatsApp Business Cloud API (`whatsapp`)
* **Category:** Messaging
* **Official Flow:** Meta Embedded Signup / WhatsApp Business Cloud API (`whatsapp_business_management`, `whatsapp_business_messaging`).
* **Onboarding Steps:**
  1. User selects or registers an eligible phone number.
  2. Phone verification completed directly with Meta.
  3. Webhook verification token and access token stored in `WhatsAppAccount`.
  4. Mascot connects WhatsApp conversations to `messageProcessor` and canonical order services.

### 2.4 Google Workspace & Analytics (`google`)
* **Category:** Productivity
* **Official Flow:** Google OAuth 2.0 (`openid`, `email`, `profile`).
* **Onboarding Steps:**
  1. Authorizes store Google account.
  2. Enables automated export of sales summaries to Google Sheets.

### 2.5 Payment Providers (M-Pesa, Stripe, Pesapal)
* **Category:** Payments
* **Flow:** Direct credentials configuration or Stripe Connect.
* **Security Rule:** Private API secrets and Passkeys are entered into dedicated encrypted forms, never conversational AI chat.

---

## 3. Connection State Machine

Every integration connection tracks one of 14 deterministic states:

```
[ NOT_CONNECTED ] ──▶ [ SETUP_REQUIRED ] ──▶ [ AUTHORIZATION_PENDING ]
                                                       │
                                                       ▼
[ FAILED ] ◀── [ VERIFICATION_PENDING ] ◀── [ CONNECTED ]
      │                     │
      ▼                     ▼
[ ACTION_REQUIRED ] ◀── [ ACTIVE ] ──▶ [ EXPIRED ] / [ REVOKED ]
                               │
                               ▼
                        [ DISCONNECTED ]
```

---

## 4. Verification & Health Probes

Integrations are verified using `IntegrationVerificationService.verifyAccount()`:
* **Facebook/Instagram:** Safe read-only probe against `graph.facebook.com/v20.0/{id}` verifying token freshness and page existence.
* **WhatsApp Cloud:** Verifies active phone number ID and webhook subscription.
* **Automatic Degraded Detection:** When a token expires or is revoked externally, status automatically transitions to `EXPIRED` or `REVOKED` and alerts the store owner.
