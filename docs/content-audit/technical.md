# Technical Architecture Specification — Alam Dairy

This document outlines the system architecture, framework stack, database model, and security protocols of the **Alam Dairy platform**.

---

## 1. Frontend Technologies
* **Framework**: Next.js 16 (App Router) utilizing TypeScript.
* **Localization Layer**: `next-intl` managing bilingual segment routing (`/[locale]/`) and static JSON dictionary translation loading.
* **Styling**: Tailwind CSS combined with `@tailwindcss/postcss` for theme utilities, alongside `shadcn/ui` components for layout.
* **Scroll Optimization**: `lenis` for smooth inertial scrolling on product and storytelling pages.
* **State Store**: Zustand (`zustand`) with storage persistence to client-side `localStorage` to preserve cart data across session cycles.

---

## 2. Backend & Database (Supabase / PostgreSQL)
The backend is powered by **Supabase**, serving as the authentication service, PostgreSQL database, storage repository, and RPC query resolver.

### Database Schema Structure
The schema is defined in the `public` schema:
* **Profiles (`profiles`)**: Links to Supabase auth users (`auth.users`). Manages client details, roles (`customer`, `farmer`, `admin`, `staff`), and farmer-specific credits.
* **Products & Inventory**: Unified database tables handling variants (`product_variants`), images (`product_media`), categorization (`categories`), and volume discount tables (`bulk_pricing_tiers`).
* **Order Ledger**: Stores order details (`orders`), line items (`order_items`), coupon definitions (`coupons`, `coupon_redemptions`), and gift cards.
* **Loyalty Ledger**: Points accounting via balance sheets (`loyalty_accounts`) and audits (`loyalty_ledger`).
* **Subscription Tables**: Tracks repeating orders (`subscriptions`, `subscription_orders`) and eligibility metrics (`product_subscription_plans`).
* **B2B Infrastructure**: B2B price lists (`b2b_price_lists`) and external supplier configurations (`vendors`).

---

## 3. Database Security & Row Level Security (RLS)
The database enforces strict RLS policies:
* **`profiles`**:
  * Users can read (`select`) and edit (`update`) only their own profile records:
    * `auth.uid() = id`
* **`products`**:
  * Publicly readable by default if flagged as active:
    * `is_active = true`
  * Write mutations (`insert`, `update`, `delete`) are restricted to profiles with administrative roles:
    * `exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))`
* **`orders`**:
  * Shoppers can select/read only their own orders. Staff and Admin profiles have full read/update permissions.
  * Public users can insert orders (enabling guest checkout workflows).
* **`order_items`**:
  * Visible if the user owns the parent order, or holds an administrative profile role.

---

## 4. Operational API & CRON Tasks
* **Authentication Callback**: `app/api/auth/callback/route.ts` manages post-login redirection.
* **Cron Renewals**: `app/api/cron/subscriptions/route.ts` validates requests against a secure environment token (`process.env.CRON_SECRET`) and invokes the database function `process_due_subscriptions()` to process recurring orders.
* **Product Catalog Queries**: Optimized API routes query catalog listings by category, brand, and type filters.

---

## 5. Third-Party Integration Architecture
Based on codebase hooks and documentation, the following integrations are configured:
1. **MFS Payment Gateways**: Custom integrations for **bKash** and **Nagad** checkout flows, with configurations prepared for **ShurjoPay** gateway middleware (`lib/payments/shurjopay.ts`).
2. **SMS Notifications**: System notifications (order confirmations, delivery tracking updates) route through **BulkSMSBD** gateway middleware (`lib/sms/bulksms.ts`).
3. **Storage Assets**: High-resolution branding and product assets are hosted on **Cloudinary CDN**, with local fallback paths.
