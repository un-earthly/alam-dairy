# Application Feature Audit — Alam Dairy

This document lists and explains every functional software feature implemented in the **Alam Dairy storefront and admin dashboard**.

---

## 1. Bilingual Routing & Localization (`next-intl`)
* **Technology**: `next-intl` (Next.js server-side routing integration).
* **Supported Languages**: Bengali (default locale `/bn`) and English (`/en`).
* **Components**: `LocaleSwitcher` for instant language toggling.
* **Scope**: All public storefront navigation, pages, buttons, tooltips, validation messages, and footer links are fully localized using bilingual dictionary maps (`messages/bn.json` and `messages/en.json`).

---

## 2. Storefront Navigation Lanes
* **Concept**: Dual-mode home page layout splits users into their appropriate commerce flows:
  * **B2C Lane**: "Dairy Products" pointing to `/[locale]/shop`. Focuses on high-visual food appeal, single-click additions, and subscriptions.
  * **B2B Lane**: "Farm Supplies" pointing to `/[locale]/farm`. Focuses on machinery, feed, livestock, and request-for-quote flows.

---

## 3. Zustand Local Cart Management
* **Technology**: Zustand state store with persistent middleware storing the state to `localStorage`.
* **State Keys**: Cart items array, total item counts, adding/removing items, quantity updates, and clear-cart functions.
* **UI Trigger**: slide-out `CartDrawer` accessible from the persistent header across all pages.

---

## 4. Checkout & Order Verification
* **Frontend Path**: `/[locale]/checkout`
* **Input Validation**: Compulsory fields: Full Name, Mobile Number (validating local 11-digit `01XXXXXXXXX` formats), Address, Delivery Area.
* **Payment Integration Options**: bKash, Nagad, Card, Bank Transfer, Cash on Delivery (COD).
* **Database Operation**: Executes SQL functions `create_order` to create `orders` and `order_items` in a single transactional unit, checking for stock levels before resolving.

---

## 5. B2C Subscription Builder
* **Frontend UI**: Integrated into individual eligible product pages.
* **Frequency Selection**: Daily, Weekly, Biweekly, Monthly selectors.
* **State Flow**: Direct SQL call via `create_subscription` to create recurring order templates that bypasses the standard cart.

---

## 6. Live Cattle Negotiation Action
* **Cattle Items**: LIVE cattle products (type = `cattle`) display a specialized UI that prioritizes phone-based quoting.
* **Direct Call CTA**: Prominent "Call for Quote" CTA button mapped to the hotline phone number `tel:01700000000`.

---

## 7. Customer Portal & Dashboard
* **Frontend Path**: `/[locale]/account`
* **Auth Guard**: Restricts view to logged-in users.
* **Features**: View order history, check current B2B farmer credit limits, track active subscriptions, and view profile information.

---

## 8. Storefront Reviews & Social Proof
* **Logic**: Verified reviews are rendered on product pages using `attachRatings` in the data layer.
* **Social Proof Badge**: A "Verified Buyer" tag is displayed next to review comments. It programmatically verifies if the user's ID matches an historical order item.

---

## 9. Comprehensive Admin Dashboard
* **Route**: `/admin` (Bypasses localized prefix path routing).
* **Role Check**: Enforced by profile roles `admin` or `staff`.
* **Modules**:
  * **Dashboard**: Key sales, subscriber metrics, and inventory alerts.
  * **Product Catalog**: Add, edit, or delete items, and configure categories and brands.
  * **Inventory Management**: Stock level views, warning levels, and warehouse logistics.
  * **Order Fulfillment**: Track order status (`pending`, `confirmed`, `processing`, `dispatched`, `delivered`, `cancelled`).
  * **Subscriptions Manager**: Monitor recurring billing pipelines and trigger renewals.
  * **Customer Directory**: Customer profiles, role updates, and credit limits.
  * **Reviews Moderation**: Review approval system to filter out spam.
