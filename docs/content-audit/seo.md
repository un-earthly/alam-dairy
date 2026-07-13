# SEO Strategy & Keyword Audit — Alam Dairy

This document specifies the search engine optimization (SEO) architecture, keyword hierarchies, and schema standards for the **Alam Dairy portal**.

---

## 1. Topical Authority Clusters
To build search engine prominence in Bangladesh's agricultural and retail sectors, content must be structured into two primary topical clusters:

```
                                  [ SEO Core ]
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
 [ B2C: Urban Fresh Dairy ]                               [ B2B: Livestock Input ]
   * Keyword: Fresh Milk Dhaka                              * Keyword: Cattle Feed BD
   * Target: Purity & Delivery                              * Target: Yield & Health
   * Supporting: A2, Doi, Ghee                              * Supporting: Machines, Cows
```

### Cluster A: Urban Fresh Dairy (B2C)
* **Pillar Page**: `/[locale]/shop`
* **Target Query Context**: Consumers in Dhaka seeking unadulterated milk, organic yogurt, and premium clarified butter.
* **Semantic Nodes**: "pure ghee price in Bangladesh", "A2 milk advantages", "organic tok doi Dhaka", "BSTI certified dairy brands".

### Cluster B: Livestock Inputs & Dairy Farming (B2B)
* **Pillar Page**: `/[locale]/farm`
* **Target Query Context**: Smallholder and commercial farmers sourcing premium feed, milking systems, and vet-certified cows.
* **Semantic Nodes**: "milking machine price in BD", "how to buy dairy cow", "Sahiwal cow milk yield", "best cattle feed brand Savar".

---

## 2. Target Keyword Matrix

| Targeted Page | Primary Keyword | Secondary Keywords | Search Intent |
| :--- | :--- | :--- | :--- |
| Home Page | fresh milk delivery Dhaka | halal dairy products Bangladesh, organic cow milk BD | Commercial / Navigational |
| Shop Home | buy fresh dairy online Dhaka | pure cow milk price, best sweets online Dhaka | Transactional |
| Farm Home | cattle feed and farm supplies BD | buy cows online Savar, agricultural supplies | Commercial / Transactional |
| Product Details (A2) | A2 cow milk Dhaka | Sahiwal A2 milk benefits, buy pure A2 milk | Transactional / Informational |
| Product Details (Ghee) | pure desi ghee price Bangladesh | grass fed cow ghee BD, buy organic ghee Dhaka | Transactional |
| Product Details (Feed) | cattle feed price in Bangladesh | milk booster feed BD, balanced dairy feed bag | Transactional |
| Product Details (Cattle) | buy Sahiwal cow Savar | vet inspected milking cows, pregnant heifer price | Commercial Investigation |
| Product Details (Milking Machine) | milking machine price in BD | single bucket milking machine, automatic cow milker | Transactional |
| Our Story | dairy farm in Madaripur | history of Alam Dairy, Md. Alam founder | Informational |
| Sustainability | zero waste dairy farm Bangladesh | biogas energy farming BD, returnable glass milk | Informational |

---

## 3. Structured Data & Schema Standards
Every page must dynamically inject JSON-LD schemas to enhance search engine rich snippets:

### A. Organization Schema (Home Page)
Provides corporate identity, logo reference, customer care phone numbers, and official social media handles.
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Alam Dairy",
  "url": "https://alamdairy.com",
  "logo": "https://alamdairy.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+880-17-00000000",
    "contactType": "customer service",
    "areaServed": "BD",
    "availableLanguage": ["Bengali", "English"]
  }
}
```

### B. Product Schema (Product Detail Pages)
Applies to B2C products, B2B feeds, and equipment.
* **Required Properties**: Name, Image, Description, Price, PriceCurrency (`BDT`), SKU/Slug, Brand, Availability (`InStock` / `OutOfStock`), and Review Rating.
* **Snippet Benefit**: Renders prices and star rating snippets directly in Google SERP lists.

### C. Live Cattle Schema (`IndividualProduct`)
* **Custom Meta Properties**: Cattle records (breed, weight, age, mother yield, vaccination status) are exposed via key-value specification fields to assist indexation.

### D. FAQ Page Schema (FAQ Page & Detail Tabs)
* **Snippet Benefit**: Expands standard search listings by rendering collapsible question/answer dropdowns.

---

## 4. Headings & Internal Linking Strategy
* **Heading Standards**: Every page must implement one single semantic `<h1>` element matching the primary keyword. Subsections must follow sequential hierarchies (`<h2>` down to `<h4>`).
* **Informational-to-Transactional Funnels**:
  * Blog post [Why We Keep a Separate A2 Herd](file:///Volumes/D/projects/alam-dairy/lib/content/blog.ts#L16) must link to the [A2 Milk Product Page](file:///Volumes/D/projects/alam-dairy/supabase/seed.sql#L15).
  * Blog post [Ghee, the Slow Way](file:///Volumes/D/projects/alam-dairy/lib/content/blog.ts#L72) must link directly to [Pure Desi Ghee 500g](file:///Volumes/D/projects/alam-dairy/supabase/seed.sql#L21).
  * Blog post [Buying Your First Dairy Cow](file:///Volumes/D/projects/alam-dairy/lib/content/blog.ts#L100) must link to the [Cattle category filter page](file:///Volumes/D/projects/alam-dairy/app/%5Blocale%5D/farm/page.tsx).
