# Page-by-Page Content Specifications — Alam Dairy

This document defines the copy structure, heading hierarchies, UI actions, and form requirements for each public and administrative route on the **Alam Dairy platform**.

---

## 1. Homepage Route (`/[locale]/`)
* **URL Match**: `/[locale]/` (`/bn/` or `/en/`)
* **Dynamic Meta Rules**:
  * *SEO Title*: `landing.hero_title` ── "Alam Dairy" (Bengali: "আলম ডেইরি")
  * *Meta Description*: `landing.hero_subtitle` ── "From fresh milk to farm-ready cattle, all in one place. Trusted by thousands of families across Dhaka."
* **Copy Structure**:
  * *Hero Headline (H1)*: "Alam Dairy"
  * *Hero Subheadline*: "From fresh milk to farm-ready cattle, all in one place. Trusted by thousands of families across Dhaka."
  * *Lane Split Cards (H2)*:
    * Card 1: "Dairy Products" (CTA: "Shop Now" -> `/shop`)
    * Card 2: "Farm Supplies" (CTA: "Browse Supplies" -> `/farm`)
  * *Founder's Story Callout (H2)*: "A Decade of Honest Dairy"
    * Note: *"I still milk the herd the way my father taught me."* ── Md. Alam, Founder.
  * *How it Works (H2)*: "Simple. Fast. Trusted."
    * Step 1: "Browse & Choose"
    * Step 2: "Place Your Order"
    * Step 3: "Fast Delivery"
  * *Featured Products (H2)*: "Fresh From The Farm"
  * *Timeline Teaser (H2)*: "From 2015 to Today"

---

## 2. B2C Shop Landing Page (`/[locale]/shop`)
* **URL Match**: `/[locale]/shop`
* **Dynamic Meta Rules**:
  * *SEO Title*: "Shop Alam Dairy | Fresh Milk, Yogurt, Ghee"
  * *Meta Description*: "Browse our fresh, halal-certified dairy products. Order fresh milk, Mishti Doi, pure desi ghee, and sweets for same-day delivery in Dhaka."
* **Copy Structure**:
  * *Header Headline (H1)*: "Shop Alam Dairy"
  * *Header Subheadline*: "Farm-fresh milk, yogurt, ghee and more — delivered to your door."
  * *Search Field Input*: Placeholder text: "Search products..."
  * *Sorting Options*: "Newest", "Price: Low to High", "Price: High to Low"
  * *Filter Category Buttons*: "All", "Milk", "Yogurt", "Ghee & Butter", "Sweets"
  * *Grid Empty State*: "No more products"

---

## 3. B2C Product Detail Route (`/[locale]/shop/[slug]`)
* **URL Match**: `/[locale]/shop/[slug]`
* **Dynamic Meta Rules**:
  * *SEO Title*: `[product.seo_title_locale]` or `[product.name_locale] | Alam Dairy`
  * *Meta Description*: `[product.seo_description_locale]` or `[product.description_locale]`
* **Copy Structure**:
  * *Breadcrumb / Category*: `product.type`
  * *Product Title (H1)*: `product.name_en` / `product.name_bn`
  * *Purity Badges*: "Halal" (Islamic Foundation Bangladesh), "BSTI Licensed".
  * *Purchase Options Card*:
    * "One-time Purchase" ── Displays retail price + quantity counter.
    * "Subscribe & Save" ── Displays frequency selector + discount badge.
  * *Tabs Section*:
    * Tab 1: "Description"
    * Tab 2: "Specifications" (Breed type, Fat %, Net Weight, Shelf Life).
    * Tab 3: "Reviews" (Star ratings, verified buyer tags).

---

## 4. B2B Farm Supplies Route (`/[locale]/farm`)
* **URL Match**: `/[locale]/farm`
* **Dynamic Meta Rules**:
  * *SEO Title*: "Farm Supplies & Livestock Market | Alam Dairy"
  * *Meta Description*: "Premium animal feed, veterinary medicines, dairy machinery, and vet-certified livestock for commercial dairy farms in Bangladesh."
* **Copy Structure**:
  * *Header Headline (H1)*: "B2B Farm Supplies"
  * *Header Subheadline*: "High-yielding dairy cattle, balanced feeds, machinery, and vet inputs direct from our Savar & Manikganj operations."
  * *Filter Category Buttons*: "All", "Cattle", "Animal Feed", "Veterinary", "Equipment"
  * *Live Cattle Card*: Displays "Vet Inspected" badge and *"Call for Quote"* CTA button.
  * *Supplies Card*: Displays "Volume Pricing Available" and standard *"Add to Cart"*.

---

## 5. B2B Supply Detail Route (`/[locale]/farm/[slug]`)
* **URL Match**: `/[locale]/farm/[slug]`
* **Dynamic Meta Rules**:
  * *SEO Title*: `[product.name_locale] | B2B Farm Supplies`
  * *Meta Description*: `[product.description_locale]`
* **Copy Structure**:
  * *Category Badge*: `product.type` (Cattle, Feed, Veterinary, Equipment).
  * *Product Title (H1)*: `product.name_en` / `product.name_bn`
  * *Cattle Inspected Badge*: "Vet Inspected" (Department of Livestock Services).
  * *Pricing Marker*: Price / unit (e.g., "৳1,80,000 / head" or "৳1,200 / 50kg bag").
  * *Action Panel*:
    * If Cattle: Primary CTA *"Call for Quote"* (`tel:01700000000`) and secondary *"Add to Cart"*.
    * If Feed/Equipment: standard *"Add to Cart"* with volume pricing table.
  * *Specs Grid (H2)*: "Specifications" (dynamically lists meta keys: breed, age, weight, mother yield, vaccine list).

---

## 6. Checkout Pipeline Route (`/[locale]/checkout`)
* **URL Match**: `/[locale]/checkout`
* **Dynamic Meta Rules**:
  * *SEO Title*: "Checkout | Confirm Order | Alam Dairy"
  * *Meta Description*: "Complete your order details. Select MFS payment via bKash/Nagad or Cash on Delivery."
* **Copy Structure**:
  * *Header Headline (H1)*: "Confirm Order"
  * *Input Forms*:
    * Name: "Full Name"
    * Mobile: "Mobile Number" (Placeholder: `01XXXXXXXXX`)
    * Address: "Address"
    * Delivery Area Dropdown: "Area"
    * Notes: "Special Instructions (optional)"
  * *Payment Selection*:
    * Options: "bKash", "Nagad", "Cash on Delivery"
    * Helper note for COD: "Pay in cash when your order is delivered."
  * *Error Messages*:
    * "Please enter your full name"
    * "Enter a valid mobile number (01XXXXXXXXX)"
    * "Please enter your full address"
    * "Please select your area"
    * "Sorry, an item in your cart is out of stock. Update your cart and try again."
  * *Order Placement Action*: Button text: "Place Order".
