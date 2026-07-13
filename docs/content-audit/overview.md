# Content Audit & AI Specification Overview — Alam Dairy

This document establishes the purpose, structure, and directory mapping for the complete reverse-engineered content specification of **Alam Dairy, Bangladesh**.

## Objective
The purpose of this specification is to translate the functional codebase, database schemas, localization dictionaries, and competitor benchmarking data of Alam Dairy into an exhaustive content blueprint. This blueprint is designed to feed into frontier Large Language Models (LLMs) to generate precise, high-conversion, and brand-aligned copy without introducing factual hallucination or technical drift.

---

## Audited Source Materials
The entire audit is compiled strictly from the following verified project files:
1. **Localization Messages**: `messages/en.json` (English) and `messages/bn.json` (Bengali) translation dictionaries.
2. **Database Schema**: `lib/supabase/types.ts` containing the structural definitions for profiles, products, orders, subscriptions, coupons, loyalty accounts, and B2B pricing.
3. **Seed Data**: `supabase/seed.sql` containing categories and sample products.
4. **Competitor Benchmarks**: `products-price-benchmark.csv` containing product-level pricing comparisons, competitors, and target margins in Bangladesh.
5. **Core Application Code**: App Router components (`app/[locale]/page.tsx`, `app/[locale]/shop/[slug]/page.tsx`, `app/[locale]/farm/[slug]/page.tsx`, and state hooks `lib/store/cart.ts`).

---

## Deliverables Map
The `/docs/content-audit/` folder contains the following 17 documents:

| File Name | Purpose |
| :--- | :--- |
| [overview.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/overview.md) | Executive summary, audited materials, and document index. |
| [business.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/business.md) | Core business profile, mission, value propositions, and customer journey. |
| [products.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/products.md) | Catalog audit, price lists, pricing model, and order fulfillment flows. |
| [services.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/services.md) | Value-added services: subscriptions, B2B credit, vet care, and farm tours. |
| [features.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/features.md) | Application functionality: multi-lingual toggle, shopping cart, admin views. |
| [technical.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/technical.md) | Backend tech stack, Supabase API, RLS security, and external services. |
| [personas.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/personas.md) | Six core user personas across B2C and B2B user categories. |
| [competitors.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/competitors.md) | Local competitive landscape analysis (Agromukam, O'Natural, Aarong Dairy). |
| [seo.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/seo.md) | Topical authority clusters, schema metadata, and keyword rules. |
| [navigation.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/navigation.md) | Page tree hierarchy, header/footer mapping, and CTA logic. |
| [brand.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/brand.md) | Tone, style, vocabulary lists, brand story, and pitches. |
| [faq.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/faq.md) | Master lists of standard B2C customer FAQs and B2B partner questions. |
| [content-map.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/content-map.md) | Content skeleton mapping sections, assets, and trust cues for key pages. |
| [page-specifications.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/page-specifications.md) | Text specification for frontend routes, including input validation labels. |
| [copy-guidelines.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/copy-guidelines.md) | Production criteria, formatting rules, and style checks for writers. |
| [frontier-prompt.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/frontier-prompt.md) | Production LLM prompt template using the generated specifications. |
| [MASTER_CONTENT_SPEC.md](file:///Volumes/D/projects/alam-dairy/docs/content-audit/MASTER_CONTENT_SPEC.md) | Consolidated master reference combining all documentation. |
