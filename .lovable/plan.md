# Implementation Plan

Scope is large — I'll ship in cohesive batches. All UI uses existing semantic tokens and current dark/sky-blue theme.

## 1. Database (single migration)

- `integration_keys` table — per-user API keys for Stripe / PayPal / Google Analytics / custom platforms.
  - Columns: `user_id`, `provider` (text), `label` (text), `api_key` (text, encrypted-at-rest by Supabase), `meta` (jsonb), `is_active` (bool).
  - RLS: owner-only CRUD.
- `seller_orders` view-style table (or query) — already covered by `orders` (seller = `vendor_id`). Add a status enum helper, no schema change needed beyond ensuring `status` supports `pending | sold | returned`.
- `shipping_jobs` table — for shipping company dashboard.
  - Columns: `order_id`, `shipper_id`, `status` (`received | sending | delivered | returned`), `return_reason`, timestamps.
  - RLS: shipper-owner + admin.
- Extend `seller_listings`: already has `parent_listing_id` + `bundle_price`. No change needed; will use them.

## 2. Payment-real Upgrade Flow

Replace immediate `activate_subscription` in `SubscriptionPlans.tsx` with a payment-method picker dialog:

- **Wallet** → call existing wallet debit RPC, then `activate_subscription`.
- **PayPal** → render existing `PayPalButton` for $9 / $20.
- **Credit/Debit Card (Stripe)** → if user has a `STRIPE_SECRET_KEY` integration row, invoke a new edge function `stripe-create-checkout`; otherwise show "Connect Stripe in Integrations" CTA.

Subscription only activates after capture confirmation.

## 3. Integrations ("APIs") Section

New tab "APIs" in `ProfilePage` for seller / shipping accounts:
- Cards for Stripe, PayPal, Google Analytics with "Connect" → modal asking for API key + label.
- Free-form "Add Custom API" form (name + endpoint + key).
- List of saved keys with toggle / delete.

## 4. Collections with Bundle Pricing

Update `SellerListings.tsx`:
- "List New Collection" creates a parent listing (`listing_type='collection'`, `bundle_price` field).
- After creation, a "Manage Items" dialog lets seller add child listings (`parent_listing_id` set, each with own price/description).
- Validation: `bundle_price < SUM(child prices)`; show savings %.

## 5. Seller Orders Dashboard

New component `SellerOrdersDashboard.tsx` mounted as a tab in `SellerDashboard`:
- Tabs: Sold / Pending / Returned.
- Reads `orders` where `vendor_id = user.id`, grouped by `status`, with timestamps.

## 6. Shipping Company Dashboard

New page section `ShippingJobsDashboard.tsx` mounted in shipping dashboard area:
- Tabs: Received / Sending / Returned.
- CRUD on `shipping_jobs`; return reason dropdown (Buyer unavailable, Buyer refused, Damaged, Other).

## 7. AI Command Center additions (paid only)

In `SellerDashboard` AI Command Center card (gated by subscription):
- **Document Analysis**: file upload (PDF/image) → `seller-ai` edge function with `type=document_analysis` (uses Lovable AI Gateway `google/gemini-2.5-pro` for vision + text).
- **Product Generator**: prompt + optional reference image → generates 1 product photo (Lovable AI Gateway image model `google/gemini-3-pro-image-preview`) + marketing description.

Edge function `seller-ai` extended with two new `type` branches; uses existing `LOVABLE_API_KEY`.

## Technical Details

- New edge functions: `stripe-create-checkout` (BYOK Stripe key from `integration_keys`), extend `seller-ai`.
- New files:
  - `src/components/integrations/IntegrationsPanel.tsx`
  - `src/components/seller/SellerOrdersDashboard.tsx`
  - `src/components/shipping/ShippingJobsDashboard.tsx`
  - `src/components/seller/AIDocumentAnalyzer.tsx`
  - `src/components/seller/AIProductGenerator.tsx`
  - `src/components/UpgradePaymentDialog.tsx`
- Edits: `SubscriptionPlans.tsx`, `SellerListings.tsx`, `SellerDashboard.tsx`, `ProfilePage.tsx`, `seller-ai/index.ts`.

## Out of scope (will note for next step)
- Stripe webhook + recurring billing (will use one-off Stripe Checkout for now; recurring requires Stripe BYOK setup beyond a single key).
- Real-time GA dashboard (just stores the Measurement ID + API secret for future use).

Confirm and I'll start with the migration + payment dialog, then ship the rest.