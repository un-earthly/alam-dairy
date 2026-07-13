# MASTER CONTENT SPECIFICATION — ALAM DAIRY, BANGLADESH

This document is the definitive master specification for **Alam Dairy, Bangladesh**. It combines all reverse-engineered business structures, product catalogs, technical stack analyses, buyer personas, competitor positioning audits, SEO parameters, and copywriting guidelines into a single reference document.

---

# Table of Contents
1. [Overview & Document Map](#1-overview--document-map)
2. [Business Profile & Operations Model](#2-business-profile--operations-model)
3. [Product Catalog & Purchase Flows](#3-product-catalog--purchase-flows)
4. [Value-Added Services](#4-value-added-services)
5. [Application Features & Navigation Lanes](#5-application-features--navigation-lanes)
6. [Technical Stack & Architecture](#6-technical-stack--architecture)
7. [User Persona Audits](#7-user-persona-audits)
8. [Competitive Landscape Audit](#8-competitive-landscape-audit)
9. [SEO Strategy & Semantics](#9-seo-strategy--semantics)
10. [Information Architecture & Navigation Menus](#10-information-architecture--navigation-menus)
11. [Brand Slogans & Pitch Assets](#11-brand-slogans--pitch-assets)
12. [Master FAQ Registry](#12-master-faq-registry)
13. [Content Skeleton Map](#13-content-skeleton-map)
14. [Page copywriting Specifications](#14-page-copywriting-specifications)
15. [Copywriting Style & Formatting Rules](#15-copywriting-style--formatting-rules)
16. [Frontier LLM Copywriter Prompt](#16-frontier-llm-copywriter-prompt)

---

# 1. Overview & Document Map
This content specification is a blueprint for Large Language Models (LLMs) and copywriters to generate marketing, operational, and transactional copy for Alam Dairy's web interfaces. 

### Audited Source Materials
The entire audit is compiled from:
* **Localization Files**: `messages/en.json` (English) and `messages/bn.json` (Bengali).
* **Database Schema Definitions**: `lib/supabase/types.ts` (tables, columns, types, and functions).
* **Seed Data**: `supabase/seed.sql` containing categories and sample products.
* **Competitor Benchmarking Data**: `products-price-benchmark.csv` containing competitor price points.
* **Core Application Code**: Router files under `app/[locale]/` and local state stores (`lib/store/cart.ts`).

---

# 2. Business Profile & Operations Model
* **Company Name**: Alam Dairy
* **Year of Establishment**: 2015
* **Founder**: Md. Alam
* **Farms**: 
  1. *Savar Home Farm* (Savar, Dhaka): Primary operations center, milking parlor, pasteurization and processing unit, and farm shop.
  2. *Gazipur Pasture* (Gazipur): 40 acres of open grazing land hosting heifers and the dedicated A2 Sahiwal herd.
  3. *Manikganj Fodder Farm* (Manikganj): Fodder cultivation (Napier grass, maize) and cattle rearing/quarantine facility.

### Brand History
Alam Dairy began in 2015 as a micro-farm in Madaripur with a single Sahiwal cow named *Lokkhi*. Md. Alam sold milk door to door on a bicycle. Over a decade of operations, the business scaled by integrating the second generation, adding resident veterinary services, building a cold-chain delivery fleet, and developing a digital storefront that services over 2,500 families and hundreds of fellow farmers across Bangladesh.

### Core Problems Solved
* **For Consumers (B2C)**: Address the high prevalence of adulterated milk (containing milk powders, preservatives, or starches) in metropolitan Dhaka by delivering certified pure, raw, and fresh dairy products directly to households.
* **For Farmers (B2B)**: Provide access to verified, healthy, disease-free, and high-yielding dairy cattle (traditionally bought in highly volatile, uncertified local markets) alongside standardized feeds, veterinary supplies, and equipment.

### Core Slogan & Mission
> "Pure milk is a promise, not a product."
Our mission is to provide unadulterated, farm-fresh dairy to households while empowering Bangladesh’s dairy farmers with high-quality supplies, transparent pricing, and veterinary support.

---

# 3. Product Catalog & Purchase Flows
The database enforces five distinct product categories under the `type` column in `public.products`:

| Category (`type`) | Focus | Target Customer | Standard Unit | Purchase Type |
| :--- | :--- | :--- | :--- | :--- |
| `dairy` | Consumer milk, ghee, yogurt, paneer, and traditional sweets. | B2C Consumers | Litre, 500ml, kg, piece | Direct / Subscription |
| `feed` | Nutritional feed, concentrate mixes, straw, and mineral licks. | B2B / Farmers | 50kg bag, 25kg bag, bale | Direct / Bulk Tiers |
| `cattle` | Live livestock: cows, heifers, breeding bulls, and calves. | B2B / Farmers | Head | Quote / Inspection |
| `equipment` | Milking machinery, storage cans, testing tools, and feeders. | B2B / Farmers | Piece, Set | Direct / Invoice |
| `vet_supply` | Supplements, hygiene chemicals, vaccines, and test kits. | B2B / Farmers | Bottle, Vial, 10-pack | Direct / COD |

### Database Tables (PostgreSQL)
* **unified Products Table (`products`)**: Holds slug, locale names, descriptions, categories (`dairy`, `feed`, `cattle`, `equipment`, `vet_supply`), pricing, sale pricing, unit representations, stock variables, metadata JSON, and eligibility variables (`subscription_eligible`).
* **Variants Table (`product_variants`)**: Maps attributes (size, breed, pack sizes) to pricing and stock levels.
* **Bulk pricing tiers (`bulk_pricing_tiers`)**: Resolves unit discounts for large volume input supplies.
* **B2B pricing mappings (`b2b_price_lists`)**: Stores role-specific farmer discount price points.

---

# 4. Value-Added Services
1. **Recurring Dairy Subscriptions**: Eligible dairy products are scheduled for automatic deliveries (daily, weekly, biweekly, monthly) with loyalty discount rates.
2. **B2B Farmer Credit Program**: Registered farmers with `is_farmer = true` can checkout feeds and inputs against a pre-assigned `credit_limit` to manage cash flow cycles.
3. **Veterinary & Quality Assurances**: All live cattle are certified under a registered veterinary program by the Department of Livestock Services. Vaccination history cards (FMD, anthrax) and quarantine certificates are provided to buyers.
4. **Agritourism Visits**: Public farm tours are hosted every Friday and Saturday morning, allowing schools and families to meet the herd.
5. **Logistics & Cold Chain**: Dawn milking is transported via cold-chain vans to Dhaka metropolitan households.

---

# 5. Application Features & Navigation Lanes
* **Bilingual Routing & Localization**: Built on `next-intl`. Swaps routes between `/bn` (default Bengali) and `/en` (English) segments dynamically using a header `LocaleSwitcher`.
* **Storefront Navigation Lanes**: Double-card layout on the homepage routes users immediately to B2C Shop (`/shop`) or B2B Farm Supplies (`/farm`).
* **Zustand Cart Drawer**: Cart states are maintained in a local Zustand store and persisted to client `localStorage`.
* **Database Order Transaction**: A single transactional function `create_order` inserts checkout orders and locks inventory to prevent overselling.
* **Livestock Quote Gateway**: Direct cattle pages disable standard cart actions and prioritize phone call inquiries (`tel:01700000000`) for custom quoting.
* **Social Proof Ratings**: Approved reviews are attached using `attachRatings` in the database, with verified buyer indicators shown for customer validation.

---

# 6. Technical Stack & Architecture
* **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui components, and Lenis for smooth scroll inertia.
* **Backend**: Supabase. Utilizes PostgreSQL databases, Row Level Security (RLS) policies, and Supabase Auth (Google logins).
* **RLS Policies**:
  * `profiles`: Users can select/update only their own rows (`auth.uid() = id`).
  * `products`: Public read-only access for active products (`is_active = true`). Write mutations restricted to staff and admins.
  * `orders`: Users see own orders. Staff and admin read/update all order lists.
* **Operational API / CRON**: `/api/cron/subscriptions/route.ts` runs batch checks of due renewals by invoking `process_due_subscriptions()` after validating environment keys (`process.env.CRON_SECRET`).

---

# 7. User Persona Audits
### Persona 1: Tanvir Rahman (The Health-Conscious Father)
* **Role**: Retail B2C Consumer (`customer`)
* **Goals**: Sourcing 100% pure, unadulterated milk and A2 milk for his children with morning delivery.
* **Pain Points**: High anxiety concerning chemical preservatives, starches, and powder reconstitution in supermarket milk.
* **CTA**: "Shop Fresh Today" -> Shop catalog.

### Persona 2: Rumana Islam (The Busy B2C Subscriber)
* **Role**: Regular B2C Consumer (`customer`)
* **Goals**: Auto-delivering weekly fresh milk and Mishti Doi via subscriptions, and auto-paying with MFS wallets.
* **Pain Points**: Forgetting to purchase fresh milk daily, leading to last-minute runs.
* **CTA**: "Subscribe & Save" -> Subscription builder.

### Persona 3: Md. Rafiqul Islam (The Smallholder Dairy Farmer)
* **Role**: B2B Farmer / Buyer (`farmer`)
* **Goals**: Sourcing high-fat feed concentrates on credit to maximize herd yields.
* **Pain Points**: Sourcing adulterated feed from local markets; lack of accessible short-term credit.
* **CTA**: "Order with Credit" -> Farm catalog checkout.

### Persona 4: Asif Chowdhury (The Commercial Farm Manager)
* **Role**: B2B Commercial Enterprise (`farmer`)
* **Goals**: Sourcing certified dairy cattle (Holstein Friesian) and high-capacity equipment with health warranties.
* **Pain Points**: Price-gouging and uncertified, sick animals in traditional haats.
* **CTA**: "Call for Quote" -> Direct Hotline phone call.

---

# 8. Competitive Landscape Audit
* **O'Natural (`onaturalbd`)**: A premium organic B2C retailer (deshi cow milk, tok doi). Strengths: Brand perception. Weaknesses: High prices (120 BDT/Ltr), no subscriptions, B2C only. Alam Dairy's competitive positioning: 80 BDT/Ltr milk and automated subscriptions.
* **Agromukam (`agromukam`)**: A digital agricultural input marketplace aggregator (feeds, cattle, machinery). Strengths: Large catalog. Weaknesses: Middleman aggregation, no own-herd health inspection certificates. Alam Dairy's competitive positioning: Own pastures, home-grown feeds, and in-house vet certification.
* **Industrial Dairies (Aarong Dairy, Pran, Milk Vita)**: Mass-market conglomerates. Strengths: Low pricing, deep distribution. Weaknesses: Reconstituted milk powder, long shelf-life preservatives. Alam Dairy's competitive positioning: Raw pasture-to-table purity delivered same-day.

---

# 9. SEO Strategy & Semantics
* **Topical Cluster A (B2C Fresh Dairy)**: "fresh milk delivery Dhaka", "pure cow milk price", "pure desi ghee price Bangladesh", "organic tok doi Dhaka".
* **Topical Cluster B (B2B Farm Supplies)**: "cattle feed price in Bangladesh", "buy cows online Savar", "milking machine price in BD", "bovine vaccines Bangladesh".
* **Schema Implementations**: Organization schema (homepage), Product schema (PDPs), and FAQPage schema (information tabs).
* **Heading Standards**: One semantic H1 per page, sequential nesting, and internal links pointing from blog posts to high-intent product pages.

---

# 10. Information Architecture & Navigation Menus
* **Header Links**: Shop, Farm Supplies, Company Dropdown (About Us, Our Story, Our Farms, Gallery, Sustainability, Certifications), Contact.
* **Footer Columns**: Brand & Halal details, Shop Categories, Farm Supplies, Company Directory, and Farm Hotline Desk (`01700000000`).
* **CTA Hierarchy**: Primary actions (Shop Now, Place Order) use primary styles, while local tasks (Call for Quote, Subscribe, Book a Visit) use secondary outlines.

---

# 11. Brand Slogans & Pitch Assets
* **Tagline**: *"Morning Light, Honest Milk"*
* **Slogan**: *"Pure milk is a promise, not a product."*
* **One-Sentence Pitch**: *"From fresh A2 milk to vet-inspected dairy cattle, Alam Dairy delivers pure farm products and agricultural supplies directly from our pastures to Dhaka households and local farmers."*

---

# 12. Master FAQ Registry
* **Is the milk pasteurized or raw?**: We offer both. Pasteurized fresh milk is chilled within hours of milking. Premium Sahiwal A2 milk can be ordered raw or pasteurized.
* **What is A2 milk?**: Most commercial milk contains A1 and A2 proteins. Our indigenous Sahiwal cow breed naturally produces milk containing only the A2 protein type, which many families find gentler on digestion.
* **Are cattle sold online healthy?**: Yes. Every animal is inspected by our resident vet, vaccinated (FMD, anthrax), dewormed, and provided with full health logs.

---

# 13. Content Skeleton Map
* **Homepage**: Hero loop video -> Story teaser -> Stats panel -> B2B/B2C lanes -> Photo gallery -> How it works -> Featured grid -> Trust badges.
* **PDP**: Product gallery -> Meta info (Halal, BSTI) -> Purchase card (Quantity, subscription toggles) -> Specs/Reviews tabs -> Cross-sell grids.
* **Checkout**: Shipping fields -> Phone validation -> Area selector -> Payment gateways -> Subtotal checkout summary.

---

# 14. Page Copywriting Specifications
* **Homepage Route**: Dynamic title "Alam Dairy". Primary CTAs route to `/shop` and `/farm`.
* **PDP Route**: Category badge, localized title, verified reviews score, purchase card, spec grid, and related products grid.
* **Checkout Route**: Name, phone (01XXXXXXXXX validation), address, area selector, bKash/Nagad/COD toggles.

---

# 15. Copywriting Style & Formatting Rules
* **Nesting**: Use sequential Markdown headers (`#` to `###`).
* **Fidelity**: Do not invent facts, metrics, or locations.
* **Density**: Maintain a natural SEO keyword density (1.0% - 1.5%).
* **Structure**: Maximum of 3 sentences per paragraph and 20 words per sentence.
* **Vocabulary**: Prefer *Mishti Doi*, *Desi Ghee*, *Sahiwal breed*, *Qurbani*, *MFS*, and local currency symbols (`৳`).

---

# 16. Frontier LLM Copywriter Prompt
For Claude, GPT, or Gemini:
```markdown
You are an elite combination of a Senior Content Strategist, Technical Copywriter, SEO Expert, UX Writer, and Brand Strategist.

Your task is to write high-converting, human-sounding, and brand-aligned website copy for **Alam Dairy, Bangladesh** (both B2C Dairy Products and B2B Farm Supplies).

1. Fact Fidelity: Do not invent product specs or history.
2. Sourcing: Reference Napier grass, vet cards, and Halal certs.
3. Slogans: Use "Pure milk is a promise, not a product" and "Milked at dawn, at your door by breakfast".
4. Formatting: Maximum of 3 lines per paragraph and 20 words per sentence.
5. Section Metadata: Include purpose, hierarchy, keywords, and structured data blocks.
```
