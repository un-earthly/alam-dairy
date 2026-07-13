# Services Specification — Alam Dairy

This document specifies the value-added agricultural, commercial, and logistic services provided by **Alam Dairy**.

---

## 1. B2C Recurring Dairy Subscriptions
The database implements a robust system for recurring deliveries of perishables like fresh milk and yogurt.

### Technical & Operational Details
* **Eligibility**: Products flagged as `subscription_eligible` (e.g., A2 Milk, Fresh Milk, Cultured Doi).
* **Frequencies Available**: Daily, Weekly, Biweekly, Monthly.
* **Database Tables**: `public.subscriptions` and `public.subscription_orders`.
* **State Management Functions**:
  * `create_subscription()`: Creates a recurring order pattern with user addresses, phone numbers, and payment details.
  * `process_subscription_renewal()`: Triggered via background scheduler to auto-generate the next order.
  * `process_due_subscriptions()`: Batch checks and runs due subscription renewals.
* **Control Features**: Users can pause, resume, cancel, or toggle `skip_next_cycle` for individual subscription orders.
* **Discount Incentives**: Built-in `discount_percent` field to award loyalty pricing for recurring commitments.

---

## 2. B2B Farmer Credit Program
To support local farm sustainability and raw material sourcing, Alam Dairy offers a structured micro-credit account service for registered smallholder and commercial farmers.

### Parameters
* **Farmer Profile**: Enforced by setting `is_farmer = true` and `role = 'farmer'` in the `profiles` table.
* **Credit Limit**: Configured per profile using the `credit_limit` column.
* **Invoicing**: Registered farmers can order feed, diagnostic kits, and machinery on account, with billing reconciled against their credit balance monthly.

---

## 3. Veterinary Health & Livestock Inspection
Alam Dairy guarantees the standard of all cattle traded or housed within its ecosystem.

### Service Commitments
* **Resident Vet Program**: A permanent veterinary presence manages herd health, weekly inspections, and treatments.
* **Immunization**: Mandatory vaccines for Foot-and-Mouth Disease (FMD) and anthrax.
* **Documentation**: Full health history logs, vaccination cards, and veterinary inspection certs are provided for every head of cattle sold.
* **Quarantine Facility**: A dedicated facility in Manikganj houses newly acquired animals for isolation and observations before they join pastures.

---

## 4. Agritourism & Farm Visit Tours
To build trust and provide transparency, Alam Dairy hosts public visits at its core farmstead.

### Parameters
* **Schedule**: Every Friday and Saturday morning.
* **Audience**: School groups, families, and prospective B2B dairy farmers.
* **Activities**: Pasture walks, observation of automated milking parlors, and raw dairy tasting sessions.
* **Booking**: Handled via email or the online contact portal.

---

## 5. Cold-Chain Delivery Logistics
A proprietary logistics network ensures same-day delivery of raw, unpasteurized, and pasteurized dairy from pastures in Savar and Madaripur to households in Dhaka.

### Standards
* **Cold Chain**: Starts immediately after dawn milking; temperature is controlled until delivery.
* **Vans**: Chilled vans for wholesale routes.
* **Riders**: Equipped with covered crates designed to maintain temperature and ensure protection from contamination during rains and flooding.
