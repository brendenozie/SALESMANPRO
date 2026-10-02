# SalesmanPro — Category Menus & Navigation Integration

**Author:** Senior Full-Stack Engineer & UI Architect  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** `CATEGORY_MENUS.ts` Integration, Role-Aware Visibility, and Super Admin Navigation

---

## 1. Store Navigation Integration (`constant/CATEGORY_MENUS.ts`)

The AI Mascot Operations Hub is integrated directly into SalesmanPro's authoritative `getCategoryMenus` function. Every business store category automatically receives the Mascot Operations section evaluated through `evaluateMenuItemsAccess`:

```typescript
const mascotMenuItem: MenuItem = {
  label: "AI Mascot & Agents",
  icon: SparklesIcon,
  minTier: "Ghuba Starter",
  subItems: [
    { label: "Operations Hub", href: `/admin/${adminSlug}/mascot`, minTier: "Ghuba Starter" },
    { label: "Agent Tasks", href: `/admin/${adminSlug}/mascot/tasks`, minTier: "Ghuba Starter" },
    { label: "Integrations & OAuth", href: `/admin/${adminSlug}/mascot/integrations`, minTier: "Ghuba Starter" },
    { label: "Pending Approvals", href: `/admin/${adminSlug}/mascot/approvals`, minTier: "Ghuba Starter" },
    { label: "Activity Timeline", href: `/admin/${adminSlug}/mascot/activity`, minTier: "Ghuba Starter" },
    { label: "Mascot Settings", href: `/admin/${adminSlug}/settings/ai-mascot`, minTier: "Ghuba Starter" },
  ],
};
```

---

## 2. Super Admin Navigation Integration (`app/super-admin/layout.tsx`)

The Super Admin Console sidebar includes a dedicated link to the platform Mascot Control Center:

```typescript
const navigation = [
  { name: "Overview", href: "/super-admin", icon: ChartBarIcon },
  { name: "Mascot & Agents", href: "/super-admin/mascot", icon: SparklesIcon },
  { name: "Integrations & APIs", href: "/super-admin/integrations", icon: KeyIcon },
  ...
];
```

---

## 3. Role & Tier Access Control

* **Subscription Tiers:** Available across `Ghuba Starter`, `Ghuba Pro`, and `Ghuba Growth` plans.
* **Role Invariants:**
  * `ADMIN` / `SUPER_ADMIN`: Full access to Operations Hub, Integrations, and Approvals.
  * `MANAGER`: Can inspect active tasks, view integrations, and draft actions.
  * `STAFF` / `AGENT`: Permitted read access to safe task status; blocked from connecting/disconnecting accounts or approving financial operations.
  * `CONSUMER`: Blocked completely from accessing business mascot routes.
