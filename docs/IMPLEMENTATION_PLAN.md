# ohoney — Implementation Plan

## Confirmed scope (21 Oct 2026)

| Decision | Choice |
|---|---|
| Order model | **Cash-on-delivery order requests** through the repo's own Express + MongoDB API. The server re-prices every order, saves it, emails the business and the customer, and returns an order number. |
| Online payment | **Razorpay prepared in test mode behind a switch** (`PAYMENTS_RAZORPAY_ENABLED`). It stays off until the client has a KYC'd Razorpay account. |
| Claims | **Treated as unverified.** Health benefits, "Organic", lab testing, customer counts, awards, strike-through discounts, team bios and the founding timeline are removed. Variety, origin, size and price stay but are listed for client confirmation. "Raw" stays as the brand's core positioning and is the **first** item on the confirmation list. |
| Stack | Kept: React 19 + Vite + React Router; Express 5 + Mongoose. framer-motion, react-hot-toast, react-icons and the unused `@emailjs/browser` are removed in favour of CSS and inline SVG, which cuts the JS bundle and gives reduced-motion support. |
| Git | One commit per stage on `redesign/launch-ready`. Nothing is pushed or merged without approval. |

### Assumptions (reversible)
- Single-origin hosting: Express serves the prerendered site and `/api` from one service. A split static + API deploy also works through `CORS_ORIGINS`.
- India-only shipping. Free over ₹499, otherwise ₹60. These rules are taken from the existing code and listed for confirmation.
- Stock is managed as an `available` flag per product in the catalogue file, not as counted inventory. That fits 4 SKUs with manual fulfilment.
- Orders are managed from email notifications and the MongoDB Atlas data browser. An admin UI is deferred.

---

## Design direction

### Direction A: "Backlit amber" (selected)
Honey's most honest visual is its **colour against light**. Colour varies with the flowers bees forage: pale wildflower, amber eucalyptus, near-black forest honey. The hero puts the three honeys side by side as backlit columns on a deep propolis-brown panel, arranged light to dark. The rest of the site is quiet: ivory paper, chocolate type, the logo's gold reserved for primary actions, and generous space.
- **Palette:** taken from the client's logo (gold `#FBB715`, chocolate `#42290A`) rather than the current off-brand forest green.
- **Type:** Fraunces at its "soft" optical setting, whose rounded, viscous terminals suit the subject, paired with Anek Latin from Ek Type, an Indian foundry, which has a native ₹ glyph.
- **Why it fits:** it turns a true product attribute into the signature visual. It works *without* product photography, which doesn't exist yet, without faking packaging, and it gets better when real photos arrive.

### Direction B: "Provision-store label" (not selected)
This takes Indian provision-store and vintage product-label vernacular: a bold logo-yellow field, a chunky Cooper-style display face, stamped roundels and bordered label panels. It's friendly and local, and it suits the script logo.
- **Rejected because** it leans towards novelty and kitsch, which undermines the premium positioning. It is also visually noisy, so it's harder to keep restrained, and it depends on decorative illustration that would need a real illustrator.

**Self-critique applied to A:** an ivory background with a serif display is close to today's generic "artisan" default. The fix is to spend the boldness in one place, the dark backlit honey panel and the light-to-dark colour logic, and to keep everything else disciplined. There are no tracked uppercase eyebrows, no "→" glued to buttons, no identical card grids (the shop uses editorial rows), and no fade-up-on-every-section. The only orchestrated motion is the honey filling the hero columns once on load, and it's disabled under reduced motion.

Full tokens are in `DESIGN_SYSTEM.md`.

---

## Backlog

### Launch requirements

Status as of 21 Oct 2026: ✅ done · 🟡 done in code, waiting on an external input · ⛔ blocked on the client

| # | Item | Acceptance criteria | Stage |
|---|---|---|---|
| L1 | Repo hygiene | Root `.gitignore`; `backend/node_modules` and `.DS_Store` untracked; `.nvmrc` = 22; root README; lint passes | 1 · ✅ |
| L2 | Dependency security | `npm audit --omit=dev` shows 0 high/critical in both packages | 1 · ✅ |
| L3 | Shared catalogue & pricing | One `shared/` module defines products (integer paise), shipping rules and validation. Both frontend and API import it. Unit tests cover totals, the shipping threshold, unknown SKUs, unavailable SKUs and quantity limits. | 2 · ✅ |
| L4 | Design system | Tokens for colour, type, space, radius, shadow, container and motion in `tokens.css`. No inline style objects remain for layout or colour. Reduced motion is respected. Every text and UI pair meets WCAG AA contrast. | 2 · ✅ |
| L5 | Homepage | Value proposition and primary action visible without scrolling at 390×844 and 1440×900. Products are reachable by keyboard and render without JS animation. No unverified claims. | 2 · ✅ |
| L6 | Shop + product pages | `/shop` lists all products. `/shop/:slug` shows variety, origin, size, price, taste, how to use, storage and availability. Legacy `/product/p1–p4` redirect. Unavailable products can't be added. | 2–3 · ✅ |
| L7 | Cart | Persists across reloads (versioned `localStorage`, reconciled against the catalogue). Drawer is a modal dialog: focus moves in and is trapped, Escape closes it and focus returns. Quantity is limited to 1–10. Changes are announced to screen readers. | 3 · ✅ |
| L8 | Checkout (COD) | Single page with labelled fields, inline errors linked through `aria-describedby`, and an error summary that receives focus. Indian mobile and PIN validation. The submit button disables while sending. Success leads to `/order/confirmed` with the order number. Errors are specific and recoverable. | 3 · ✅ |
| L9 | Orders API | `POST /api/orders` validates every field on the server, re-prices from the catalogue and rejects unknown or unavailable SKUs. It returns `409` when the client's expected total differs from the server total, saves the order, is idempotent on `Idempotency-Key` (same key gives the same order; same key with a different body gives `409`), and notifies by email without failing the order if email fails. | 4 · ✅ |
| L10 | Enquiries API | `POST /api/enquiries` (contact or wholesale) with validation, a honeypot, rate limiting, storage and email notification. The Contact and Wholesale pages use it with success and error states. | 4 · ✅ |
| L11 | API hardening | Security headers, CORS allow-list, 20 kb body limit, per-IP rate limits on writes, no stack traces in responses, request IDs, logs without customer PII, and a `/api/health` endpoint that reports DB status. | 4 · ✅ |
| L12 | Razorpay (switched off) | Server-side Razorpay order creation, payment signature verification (HMAC-SHA256, timing-safe), and a webhook with signature verification and event-ID de-duplication. The amount is checked against the stored order. Tests use fake secrets. The UI option appears only when the switch is on. | 4 · 🟡 needs Razorpay keys |
| L13 | Content & policies | FAQ, Shipping, Returns, Privacy and Terms pages built from the stated rules. Each is marked **awaiting client approval** in the handoff. All footer links resolve. Contact details live in one config file. | 3 · 🟡 needs client details and approval |
| L14 | SEO | Each route is prerendered to static HTML with its own title, description, canonical and OG tags. `sitemap.xml` and `robots.txt` exist, plus an OG image. JSON-LD covers Organization and Product, with offers from real prices and no ratings. The 404 page and order confirmation are `noindex`. | 5 · ✅ |
| L15 | Accessibility | Skip link, landmarks, one `h1` per page, visible focus, 24 px minimum targets, and no failures from axe on any route at 390 and 1440 px. Keyboard-only purchase journey verified. | 5 · ✅ automated; screen-reader pass pending |
| L16 | Performance | JS under 100 KB gzip on first load; fonts self-hosted with critical faces preloaded; Lighthouse lab run recorded (mobile emulation). | 5 · ✅ lab |
| L17 | Tests | API tests (validation, pricing, idempotency, totals mismatch, unavailable SKU, enquiries, rate limit, Razorpay signatures and webhook de-duplication), a Mongo integration test, and a browser smoke run of the purchase journey. | 4–5 · ✅ |
| L18 | Deployment | `.env.example` files with names only, a production start script that serves the static site and API, a hosting guide, a rollback procedure and backup guidance. | 6 · 🟡 not deployed |
| L19 | Handoff docs | `CLIENT_HANDOFF.md`, `QA_REPORT.md`, `DESIGN_SYSTEM.md` and a client content checklist. | 6 · ✅ |

### Deferred (future improvements)
- Razorpay live mode: needs the client's account, KYC and live keys. The code is ready.
- An admin UI for order status, or a move to a hosted commerce platform once volume justifies it.
- Counted inventory with reservation and decrement.
- Discount codes. There are none today, and the fake strike-through prices were removed.
- Reviews. They need a real collection method, and none will be invented.
- A CMS for copy and products, e.g. a Git-based CMS.
- Telugu or Hindi localisation.
- Real-user performance monitoring (CrUX or web-vitals beacon) after launch.

## Stages (all complete; commits on `redesign/launch-ready`)
1. **Audit & scope**: audit, plan, repo hygiene, dependency fixes. `3618353`
2. **Design system & representative pages**: tokens, layout shell, homepage, shop and product. `e212f8d`
3. **Remaining pages & journeys**: cart, checkout, story, contact, wholesale, FAQ, policies and states. `e212f8d`, `e2c2b01`
4. **Integrations & reliability**: API, persistence, email, Razorpay behind the switch, tests. `e2c2b01`
5. **Polish & verification**: prerender and SEO, accessibility and performance audits, cross-width review, security fixes. `dd5cfad`
6. **Handoff**: documentation, launch checklist, verdict. (final commit)
