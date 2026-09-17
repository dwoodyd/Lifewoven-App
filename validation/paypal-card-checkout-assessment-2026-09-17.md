# PayPal Card Checkout Assessment — 2026-09-17

## Current Lifewoven checkout

Lifewoven creates recurring memberships through PayPal's REST `POST /v1/billing/subscriptions` endpoint. The existing server-side flow creates the subscription only after authenticating the user, enforces founding-rate eligibility in the database, and verifies the returned subscription before it grants membership. The checkout remains PayPal-only; no Stripe or independent processor has been added.

## Card / guest checkout finding

PayPal's official Guest Checkout guidance states that **REST automatic payments** and subscription or automatic-billing buttons do not offer standard guest checkout. It says that guest checkout for PayPal Subscription and Automatic Billing buttons requires the **Enhanced Automatic Payments** product. The ordinary *PayPal account optional* setting is necessary for eligible Checkout products, but it does not by itself enable cards for Lifewoven's REST subscription flow. Buyer availability is still risk- and location-dependent.

> "REST automatic payments" are listed among products without standard guest checkout. "PayPal HTML Installment, Subscription, and Automatic Billing buttons" require Enhanced automatic payments to have guest checkout. [1]

The live subscription route already hands the buyer to PayPal's hosted approval experience. After Enhanced Automatic Payments is enabled for the merchant account, PayPal—not Lifewoven—determines which eligible debit or credit card / guest option can be offered at that hosted checkout.

## Source-owned improvements completed

The Pricing screen now explains that checkout is completed securely with PayPal and that debit or credit card checkout appears there when available for the buyer's account and location. This is deliberately conditional and does not promise an option the current merchant configuration cannot force.

## Required merchant action

An authorized PayPal business-account owner must sign in and enable or request **Enhanced Automatic Payments / Advanced Card Payments for subscriptions**. PayPal's published guest-checkout settings also instruct the owner to confirm the PayPal email and set **Account Optional** to **On** under **Account Settings → Website payments → Website preferences**. Both settings must be verified with a real buyer profile in the intended market after activation.

## Sources

[1] [PayPal: How do I accept cards with Checkout using the Guest Checkout option?](https://www.paypal.com/us/cshelp/article/how-do-i-accept-cards-with-checkout-using-the-guest-checkout-option--help307)

[2] [PayPal: Set up advanced credit and debit card payments](https://developer.paypal.com/platforms/checkout/advanced)

[3] [PayPal: JavaScript SDK reference](https://developer.paypal.com/sdk/js/reference)
