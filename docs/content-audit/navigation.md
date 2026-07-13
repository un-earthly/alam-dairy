# Navigation & Information Architecture — Alam Dairy

This document specifies the page routing structure, site maps, menus, and call-to-action (CTA) hierarchies of the **Alam Dairy platform**.

---

## 1. Information Architecture & Page Hierarchy
The application is structured under a dual-locale route wrapper (`/[locale]/` where locale is `bn` or `en`), except for the administrative console (`/admin`), which remains unlocalized:

```
├── Root Directory (/)
│   ├── B2C Segment (/[locale]/shop)
│   │   └── Product Details (/[locale]/shop/[slug])
│   ├── B2B Segment (/[locale]/farm)
│   │   └── Supply Details (/[locale]/farm/[slug])
│   ├── Cart Panel (/[locale]/cart)
│   ├── Checkout Pipeline (/[locale]/checkout)
│   ├── User Portal (/[locale]/account)
│   ├── Company Content
│   │   ├── About Us (/[locale]/about)
│   │   ├── Our Story (/[locale]/our-story)
│   │   ├── Our Farms (/[locale]/farms)
│   │   ├── Certifications (/[locale]/certifications)
│   │   ├── Sustainability (/[locale]/sustainability)
│   │   └── Gallery (/[locale]/gallery)
│   └── Support Content
│       └── Contact Us (/[locale]/contact)
└── Admin Management Portal (/admin)
    ├── Products Panel (/admin/products)
    ├── Orders Ledger (/admin/orders)
    ├── Inventory Tracker (/admin/inventory)
    └── Customers Panel (/admin/customers)
```

---

## 2. Header & Navigation Menus
### Persistent Header Links
1. **Shop** (B2C Landing) ── Links to `/[locale]/shop`
2. **Farm Supplies** (B2B Landing) ── Links to `/[locale]/farm`
3. **Company** (Mega Menu Dropdown)
   * *About Us* ── `/[locale]/about` ("Who we are and what we stand for")
   * *Our Story* ── `/[locale]/our-story` ("A decade of milestones on the farm")
   * *Our Farms* ── `/[locale]/farms` ("Where your milk comes from")
   * *Gallery* ── `/[locale]/gallery` ("Life at the farm in pictures")
   * *Sustainability* ── `/[locale]/sustainability` ("Farming that gives back to the land")
   * *Certifications* ── `/[locale]/certifications` ("Halal, safety and quality standards")
4. **Contact** ── Links to `/[locale]/contact`

### Mega-Menu Highlight Components
* **Dairy Products Panel**: Displays direct links to milk, yogurt, ghee, and sweets. Features a visual banner: *"Milked at dawn, at your door by breakfast"* with the CTA *"Shop fresh today"*.
* **Farm Supplies Panel**: Displays links to cattle, animal feed, veterinary medicines, and equipment. Features the CTA *"Browse Supplies"*.

### Header Utility Tools
* **Locale Switcher**: Toggle button swaps between Bengali (`bn`) and English (`en`) segments of the current route.
* **Cart Button**: Interactive indicator showing total items in Zustand state; clicks slide open the `CartDrawer`.

---

## 3. Footer Links
The site footer consolidates directory links and trust banners:

* **Col A: Brand Identity**: Logo, founding date ("Since 2015"), social links, and Islamic Foundation Halal badge.
* **Col B: Dairy shop**: Milk, Yogurt & Doi, Ghee & Butter, Sweets.
* **Col C: Farm supplies**: Cattle, Feed, Veterinary, Equipment.
* **Col D: Company**: Our Story, Our Farms, Certifications, Sustainability, Blog.
* **Col E: Contact Desk**:
  * Address: Alam Dairy, Madaripur, Bangladesh
  * Phone hotline: `01700000000` (7am - 9pm)
  * Email link.

---

## 4. Call-To-Action (CTA) Hierarchy
To guide users through checkout funnels, the storefront applies standard CTA styles:

1. **Primary Global CTAs (Action-Oriented)**
   * *B2C Shop Button*: "Shop Now" (redirects to shop catalog).
   * *B2B Farm Button*: "Browse Supplies" (redirects to farm catalog).
   * *Checkout Process*: "Place Order" (concludes checkout).
2. **Secondary Local CTAs (Context-Oriented)**
   * *In-stock Shop Items*: "Add to Cart" (adds item and opens cart drawer).
   * *Eligible Dairy Items*: "Subscribe" (opens subscription setup).
   * *Live Cattle Items*: "Call for Quote" (drives phone calls to `01700000000`).
   * *Farm Tours Page*: "Book a Visit" (links to booking details).
