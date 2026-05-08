# Alam Dairy Firm

E-commerce platform for Alam Dairy Firm, Bangladesh. Sells dairy products (B2C) and farm supplies / cattle (B2B) from a single storefront.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS + shadcn/ui**
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)
- **next-intl** (Bengali default, English toggle)
- **Zustand** (cart state, persisted to localStorage)

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in Supabase credentials.
2. Run the SQL migration at `supabase/migrations/001_initial_schema.sql` in your Supabase project SQL editor.
3. `npm install && npm run dev`

## Project Structure

```
app/
  [locale]/          # /bn (default) and /en
    page.tsx         # dual-mode landing
    shop/            # B2C dairy products
    farm/            # B2B farm supplies + cattle
    checkout/        # checkout form
    account/orders/  # order history
  admin/             # admin panel (no locale prefix)
    page.tsx         # dashboard
    products/        # product management
    orders/          # order management
    inventory/       # stock view
    customers/       # customer list
components/
  layout/            # Header, Footer, LocaleSwitcher
  product/           # ProductCard, ShopFilters, AddToCartButton
  cart/              # CartDrawer
  checkout/          # CheckoutForm
  admin/             # ProductForm, OrderStatusSelect
lib/
  supabase/          # client.ts, server.ts, types.ts
  store/             # cart.ts (Zustand), ui.ts
messages/
  bn.json            # Bengali translations
  en.json            # English translations
supabase/
  migrations/        # 001_initial_schema.sql
```

## Database Setup

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor. It creates:

- `profiles` — user profiles with roles (`customer`, `farmer`, `admin`, `staff`)
- `products` — unified product table (`dairy`, `feed`, `cattle`, `equipment`, `vet_supply`)
- `orders` — orders with address JSON, payment method, status
- `order_items` — line items per order
- Row Level Security on all tables
- Auto-profile trigger on user signup
- Seed data: 5 sample products

## Admin Access

Go to `/admin`. User must have `role = 'admin'` or `role = 'staff'` in the `profiles` table.

```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

## To Do (v1.1+)

- Supabase Storage integration for product images
- ShurjoPay payment gateway (`lib/payments/shurjopay.ts`)
- BulkSMSBD order SMS notifications (`lib/sms/bulksms.ts`)
- Subscription flow for recurring milk/yogurt delivery
- Cattle quote/negotiation flow
