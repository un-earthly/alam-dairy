# User Persona Audit — Alam Dairy

This document profiles the six core user segments targeting the **Alam Dairy storefront and admin portal**.

---

## Persona 1: Tanvir Rahman (The Health-Conscious Father)
* **User Segment**: Retail B2C Consumer
* **Database Role**: `customer` (is_farmer = false)
* **Location**: Mirpur, Dhaka
* **Profile**: Married with two children (ages 4 and 7). Working as a corporate bank manager.

### Goals
* Source 100% pure, unadulterated cow milk for his children's daily diets.
* Ensure all dairy items consumed are Halal certified by recognized authorities.
* Secure reliable morning delivery before the kids leave for school.

### Pain Points
* High anxiety concerning the presence of chemical preservatives, starches, and reconstitution powders in industrial milk cartons.
* Inability to verify farm sources or milking conditions of supermarket brands.

### Buying Motivations & CTAs
* **Motivations**: Deep trust in farm transparency (wants to read about the Gazipur pastures and Sahiwal A2 cows).
* **Objections**: "Is this actually fresh or is it reconstituted?" (Requires BSTI and Halal badges on every screen).
* **CTA Recommendation**: "Shop Fresh Today" pointing to the Dairy category.

---

## Persona 2: Rumana Islam (The Busy B2C Subscriber)
* **User Segment**: Regular B2C Consumer
* **Database Role**: `customer` (is_farmer = false)
* **Location**: Dhanmondi, Dhaka
* **Profile**: Software engineer living in a joint family household.

### Goals
* Automate the weekly supply of fresh milk and Mishti Doi without needing to remember to order every evening.
* Pay automatically using MFS (bKash/Nagad) wallets.
* Easily pause shipments when the family travels.

### Pain Points
* Forgetting to purchase fresh milk daily, leading to last-minute retail runs.
* Rigid e-commerce delivery slots that clash with her working hours.

### Buying Motivations & CTAs
* **Motivations**: Convenience, predictable deliveries, and subscription discount rates.
* **Objections**: "Am I locked into this contract if I go on holiday?" (Requires clear messaging on the `skip_next_cycle` button).
* **CTA Recommendation**: "Subscribe & Save" on the fresh milk details page.

---

## Persona 3: Md. Rafiqul Islam (The Smallholder Dairy Farmer)
* **User Segment**: B2B Farmer / Buyer
* **Database Role**: `farmer` (is_farmer = true)
* **Location**: Savar, Dhaka
* **Profile**: Operates a family dairy farm with 12 milking cows.

### Goals
* Maximize the milk yield and fat percentage of his herd.
* Purchase feed concentrates, wheat bran, and mineral supplements on credit during seasonal cash flow pinches.
* Prevent livestock disease outbreaks through prompt access to diagnostic test kits.

### Pain Points
* Local market feed is frequently adulterated with fillers, reducing cow yield.
* Lack of access to low-interest commercial credit lines to purchase inputs during dry seasons.

### Buying Motivations & CTAs
* **Motivations**: Standard B2B credit accounts and high-performance feed availability (TMR feeds, bypass fats).
* **Objections**: "Are these feeds certified safe for dairy cows?"
* **CTA Recommendation**: "Order with Credit" or "Add to Cart" in B2B Farm Supplies lane.

---

## Persona 4: Asif Chowdhury (The Commercial Farm Manager)
* **User Segment**: B2B Commercial Enterprise
* **Database Role**: `farmer` (is_farmer = true)
* **Location**: Sirajganj, Bangladesh
* **Profile**: Manages a medium-scale dairy facility with a herd of 80+ cattle.

### Goals
* Safely purchase high-yield dairy cows (Holstein Friesian / Sahiwal) with verified health files.
* Acquire high-capacity machinery (milking machines, 100L chilling tanks) with warranties.
* Build direct lines of communication for volume feed purchases.

### Pain Points
* Traditional cattle markets (*haats*) are notorious for price-gouging, lack of documentation, and trading sick animals.
* Difficulties sourcing genuine stainless steel equipment with local technical support.

### Buying Motivations & CTAs
* **Motivations**: Vet-inspected cattle guarantees, clear mother yield records, and structured quote pathways.
* **Objections**: "Can I inspect the animal before pay?" (Needs messaging about Manikganj quarantine facility).
* **CTA Recommendation**: "Call for Quote" (redirects to farm office).

---

## Persona 5: Md. Alam (The Farm Owner & Administrator)
* **User Segment**: Internal Operations
* **Database Role**: `admin`
* **Location**: Madaripur / Savar Farms
* **Profile**: Platform owner monitoring all operational divisions.

### Goals
* Monitor aggregate sales volumes, subscriber retention rates, and catalog stock warnings.
* Set B2B price lists and adjust farmer profile credit limits.
* Manage order routing to cold-chain delivery vans.

### Pain Points
* Coordinating inventory balances across multiple physical warehouses.
* Filtering spam reviews from the public storefront while maintaining authentic feedback.

### Buying Motivations & CTAs
* **Motivations**: Clean data dashboards, rapid status toggles, and unified inventory tracking.
* **CTA Recommendation**: "/admin Dashboard panel".

---

## Persona 6: Dr. Fahmida Hasan (The Resident Veterinarian)
* **User Segment**: Internal Staff
* **Database Role**: `staff`
* **Location**: Savar Home Farm
* **Profile**: Doctor of Veterinary Medicine (DVM) overseeing livestock welfare.

### Goals
* Audit and record health histories, vaccine doses, and diagnostic test parameters for all active herds.
* Identify high-performing cows to assist in selection for breeding.
* Moderate reviews concerning animal health or veterinary supplies on the platform.

### Pain Points
* Keeping paper treatment logs synchronized with database profiles.
* Managing the vaccine schedule of 100+ heifers and calves manually.

### Buying Motivations & CTAs
* **Motivations**: Direct access to livestock records and review moderation portals.
* **CTA Recommendation**: "Approve/Reject Reviews" in admin console.
