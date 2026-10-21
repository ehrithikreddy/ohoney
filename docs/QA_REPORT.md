# ohoney QA Report

**Date:** 21 Oct 2026 · **Branch:** `redesign/launch-ready`

This report covers only checks that were actually run. Anything not run is listed under "Not tested".

## Test environment

| Item | Value |
|---|---|
| OS | macOS (darwin), local machine |
| Node | 22.22.1 (via nvm; `.nvmrc` = 22) |
| Browser automation | Playwright driving Chromium 151.0.7922.138 |
| Lighthouse | 13.5.0, run against Google Chrome (headless) |
| Accessibility engine | axe-core 4.10.3, WCAG 2.0/2.1/2.2 A and AA plus best-practice rules |
| Database | MongoDB 9.0.4, local throwaway instance |
| Email | Real SMTP to a local capture server (`smtp-server`), so messages were actually transmitted and parsed |
| Server mode | `NODE_ENV=production`; Express serving the prerendered build plus the API on one origin (the recommended deployment shape) |

## Automated tests

| Suite | Command | Result |
|---|---|---|
| Shared catalogue, pricing and validation | `npm test --prefix shared` | **20 passed** |
| Cart persistence logic | `npm test --prefix frontend` | **5 passed** |
| API (orders, enquiries, payments, static serving, config) | `npm test --prefix backend` | **42 passed**, plus 4 skipped without a database |
| API against a real MongoDB | `MONGODB_TEST_URI=… npm test --prefix backend` | **46 passed** (the 4 integration tests included) |
| Lint | `npm run lint` | Clean (it failed with 13 errors before) |
| Clean-clone build | `git clone` → `npm run build` → `npm test` | Passed |
| CI | `.github/workflows/ci.yml` | Written, but **not yet run on GitHub**; the branch hasn't been pushed |

### What the API tests prove
- The server re-prices every order from the catalogue. Client-sent prices are ignored, and a tampered `expectedTotal` returns 409 and creates no order.
- Unknown or unavailable products return 409 `CART_CHANGED`. Invalid quantities, empty carts and unknown payment methods return 400.
- `abcdefghij` as a phone and `abcdef` as a PIN, both accepted by the old checkout, are rejected.
- **Idempotency:**
  - a retry returns the same order and sends no extra email;
  - the same key with different details returns 409;
  - 5 simultaneous identical submits create exactly 1 order, in memory and on real MongoDB.
- An SMTP outage never loses an order. The order is stored, the failure is recorded on it, and it can be retried later with `npm run orders -- resend-failed`.
- Logs contain no customer name, email, phone or address.
- Customer input is HTML-escaped in emails.
- The honeypot flags an order and suppresses the customer email.
- At most 3 customer copies are sent to one address per day; the business is always notified.
- Rate limits: the 11th order or 6th enquiry from one IP within 15 minutes gets 429. Failed attempts don't count.
- **Razorpay, with the switch on and a fake client:**
  - the Razorpay order is created for the server-computed amount;
  - a valid signature marks the order paid once;
  - forged signatures are rejected;
  - a webhook with a bad signature is rejected;
  - duplicate deliveries are ignored;
  - amount mismatches are flagged, never accepted;
  - a failed processing attempt is retried;
  - concurrent retries settle on one Razorpay order ID;
  - `/verify` doesn't reveal which order numbers exist.
- Static serving: prerendered pages, a real 404 status, one-year immutable caching for fingerprinted assets, `no-cache` HTML, gzip, legacy `/product/:id` 301 redirects, and blocked traversal attempts.
- Production config refuses to start without MongoDB or order email. An invalid `TRUST_PROXY` is rejected.

## Browser journeys (verified by hand in Chromium)

| Journey | Result |
|---|---|
| Home → product → quantity 2 → Add to cart | ✅ Drawer opens with focus inside. The live region announces "Added 2 × Wildflower Honey to your cart." |
| Escape closes the drawer | ✅ Focus returns to the Add to cart button |
| Reload keeps the cart | ✅ "Cart, 2 items" after reload |
| Checkout with an empty form | ✅ The error summary receives focus and lists 7 errors linked to their fields. Each invalid field has `aria-invalid` and is described by its hint and error. |
| Checkout with an invalid phone | ✅ Only the phone error remains |
| Place order (COD) | ✅ One `POST /api/orders` with an Idempotency-Key. The confirmation page shows the order number, the next steps and the total to pay. The cart clears. |
| Order stored | ✅ In MongoDB with server-computed totals, `cod_due` status and `notifications: sent/sent` |
| Emails | ✅ The business email (reply-to the customer) and the customer confirmation were delivered over SMTP. Content checked. |
| **Keyboard-only purchase** | ✅ Skip link (visible 3 px focus) → hero honey link → product page (focus moves to `<main>`) → quantity → Add to cart → drawer → Check out → every field and the state dropdown by keyboard → Place order → confirmation |
| Contact form | ✅ Validation summary, then delivery. Focus moves to "Message sent". Email arrives. |
| Wholesale form | ✅ Same as contact |
| Mobile menu | ✅ Opens as a modal with focus inside. Following a link closes it and lands focus on `<main>`. |
| 404 | ✅ HTTP 404, `noindex`, helpful links |
| Legacy URL `/product/p3` | ✅ 301 to `/shop/eucalyptus-honey` |
| Policy pages | ✅ Render, with visible "[To be provided: …]" markers (7 on Terms) for missing legal details |
| Console errors | ✅ None on any route, apart from the intended 404 document response |
| CSP | ✅ No violations during the journeys. The policy also blocked an injected inline script, as designed. |

## Responsive review

Routes checked: `/`, `/shop`, `/shop/forest-honey`, `/about`, `/wholesale`, `/contact`, `/faq`, `/terms`, `/checkout` and the 404 page.

- **Widths:** 360, 390, 768, 1024 and 1440 px.
- **Horizontal overflow:** none on any route at any width. Before, Home, Product, About and Contact overflowed by 38 px at 390.
- **Target size (WCAG 2.2 2.5.8):** one 23 px footer link was found. It already passed through the spacing exception, and was then given a 24 px minimum.
- **Screenshots** are in `docs/screenshots/after/` (1440 and 390). Baselines are in `docs/screenshots/before/`.

## Accessibility (axe-core 4.10.3)

**33 page states, 0 violations.** That covers the 15 routes at 390 and at 1440 px, plus three interactive states: the open cart drawer, the checkout with errors showing, and the open mobile menu. The first run found one best-practice issue (the WhatsApp shortcut sat outside a landmark). It was fixed and the run repeated.

axe reports colour contrast as "incomplete" on the gradient honey panels because it can't compute contrast over gradients. Those pairs were checked numerically instead: see the contrast table in `DESIGN_SYSTEM.md`, where every text pair is ≥ 4.5:1 and every UI pair ≥ 3:1.

Reduced motion was verified: with `prefers-reduced-motion: reduce`, the pour animation is `none` and `scroll-behavior` is `auto`.

**Automated tools catch only part of WCAG.** Not yet done: a screen-reader pass (VoiceOver, NVDA or TalkBack), a 200% zoom and text-spacing review, and Windows High Contrast mode.

## Performance (Lighthouse 13.5.0, lab data)

The run was on localhost against the production-mode server with gzip. Mobile uses Lighthouse's default simulated throttling (slow 4G, 4× CPU); desktop uses the desktop preset. These are **laboratory measurements, not real-user data**. Production adds real network latency and TLS.

| Page | Device | Perf | A11y | Best practices | SEO | FCP | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | mobile | 96 | 100 | 100 | 100 | 1.7 s | 2.6 s | 0 | 0 ms |
| `/shop/forest-honey` | mobile | 96 | 100 | 100 | 100 | 1.7 s | 2.6 s | 0 | 0 ms |
| `/checkout` | mobile | 97 | 100 | 100 | 66 | 1.4 s | 2.4 s | 0.068 | 0 ms |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0.5 s | 0 | 0 ms |
| `/shop/forest-honey` | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0.5 s | 0 | 0 ms |
| `/checkout` | desktop | 100 | 100 | 100 | 66 | 0.3 s | 0.5 s | 0.024 | 0 ms |

- Checkout's SEO score of 66 is **intentional**: the page is `noindex`.
- Before compression was added, mobile performance was 84–86 with an LCP of 3.5–3.8 s.
- JavaScript is 92 KB gzipped (it was 137 KB). CSS is 7 KB gzipped. Fonts total about 107 KB, with the two critical files preloaded.
- Checkout's small CLS comes from swapping the prerendered "Loading your cart…" for the form. It is under the 0.1 "good" threshold.
- Mobile LCP of 2.4–2.6 s sits on the 2.5 s "good" boundary in this lab setup. Measure it on the real host with field data after launch.

## Security review

An independent review of the API, shared validation and checkout client was carried out as a code-reading review; it didn't execute the code. It found **no way to get goods without paying, manipulate prices, forge payments, inject NoSQL, traverse paths or leak PII in logs**.

It did raise 8 findings: 3 medium, 1 low-medium and 4 low. **All are fixed and covered by tests** (commit `dd5cfad`):
- order-form mail abuse, now capped per recipient;
- the Razorpay order-ID race, now a conditional write;
- `TRUST_PROXY` parsing, now strict and logged;
- a regex backtracking risk, now linear with the length checked first;
- display-name injection in emails, now rejected;
- amount-mismatch overwrite, now guarded;
- unbounded contact fields, now dropped;
- the order-number oracle on `/verify`, now one response.

Hardening applied: SMTP `requireTLS` in production, webhook de-duplication bound to the signed body, rate limits that ignore failed attempts, and a stronger fallback idempotency key.

Dependencies: `npm audit` reports **0 vulnerabilities** in frontend and backend. Before, there were 2 high in the frontend, and 1 critical and 2 high in the backend. New dependencies were pinned to releases at least two weeks old.

## Not tested, or limited

| Area | Status |
|---|---|
| Safari, Firefox, iOS and Android devices | **Not tested.** Only Chromium was available. Native `<dialog>` works in all current browsers; the drawer's slide animation (`@starting-style`) needs Safari 17.5+ or Chrome 117+, and older browsers simply open it without animation. **Test on real iPhone and Android before launch.** |
| Razorpay end-to-end | **Not tested against Razorpay**, because there are no keys. It is covered by unit and API tests with a fake client and real HMAC signatures. Needs a test-mode run with the client's keys. |
| Real SMTP provider (Gmail, Brevo, Zoho…) | Not tested. Only the local SMTP capture server was used. |
| Hosting, TLS, domain, CDN | Not deployed. No staging URL exists yet. |
| Load and concurrency beyond the idempotency tests | Not load-tested. The traffic assumption is a small shop, tens of orders a day. |
| Screen readers, zoom, high contrast | Not done (see above). |
| Real-user performance (CrUX or web-vitals) | Not available before launch. |
