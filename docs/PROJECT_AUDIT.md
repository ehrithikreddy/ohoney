# ohoney — Project Audit

**Audited:** 21 Oct 2026, at commit `2104ce0` on `main` (working tree clean)
**Method:** I read every source file, ran `npm run lint`, `npm run build` and `npm audit`, and served the site with Vite. I drove the site in Chromium (Playwright) at 1440 and 390 px. Baseline screenshots are in `docs/screenshots/before/`.

> This audit describes the code **as found**. What changed afterwards is in `IMPLEMENTATION_PLAN.md` and `QA_REPORT.md`.

## 1. What the project is

| Question | Finding |
|---|---|
| Stack | React 19 + Vite 8 single-page app (`frontend/`). The routes use React Router 7, motion uses framer-motion, notifications use react-hot-toast and icons use react-icons. Styling is almost entirely inline `style={{}}` objects. `@emailjs/browser` is installed but never imported. |
| Backend | `backend/` declares Express 5, Mongoose 8, cors and dotenv, but `backend/index.js` is **0 bytes**. No routes, models or server exist. |
| Business model (inferred) | It's meant to be a direct-to-consumer **transactional store** for raw honey in India. The evidence is the cart, a 3-step checkout, cash on delivery, a "Razorpay coming soon" card and the Mongo dependency. There's also a wholesale enquiry form and WhatsApp contact. |
| Brand | The brand name is **ohoney** and the intended domain is `ohoney.in`. The client logo is a gold "O" ring with a bee and the script "Honey — sign of purity" with a ® mark. It exists only as raster PNG favicons (max 512 px, opaque white background). Logo colours are gold `#FBB715` and chocolate `#42290A`. |
| Catalogue | There are 4 hard-coded SKUs in `src/data/products.js`: Wildflower 500 g ₹399, Forest 250 g ₹299, Eucalyptus 300 g ₹349 and a Sampler 3×100 g ₹499. Prices are stored as strings (`'₹399'`). |
| Repo hygiene | `backend/node_modules` (1,530 files) and `.DS_Store` files are committed. There's no root `.gitignore`, root README, `.env.example`, test suite, CI or deployment config. `frontend/README.md` is the Vite template text. |

## 2. Status of each user journey (verified in the browser)

| Journey | Result |
|---|---|
| Browse homepage → product grid | **Partial.** The cards are hidden (`opacity:0`) until they scroll into view. **3 of 4 product images fail to load** (Unsplash returns `ERR_BLOCKED_BY_ORB`), and the 4th shows **a strawberry**. |
| Product detail page | **Partial.** The gallery for "Wildflower Honey" shows a strawberry, a honey jar and **a watermelon**. Quantity works. The add-to-cart button calls `addItem` *n* times, which fires *n* toasts. |
| Add to cart / drawer | Works in memory. **The cart is lost on reload.** Escape doesn't close the drawer, focus isn't trapped and there's no dialog role. |
| Checkout (3 steps) | **Broken (critical).** "Place Order" sends **zero network requests**. It shows "Order placed successfully" and empties the cart, so the order is lost and the business is never told. Validation is client-only: a phone of `abcdefghij` and a pincode of `abcdef` are accepted. Prices come from client-side strings. |
| Contact / wholesale forms | **Broken.** Both show success toasts but send nothing anywhere. |
| FAQ | It exists only as a tab on Contact, with 5 answers. Nobody has verified the claims in it. |
| Navigation | "Products" from another page goes to `/#products` but stays at the top. **The logo and nav links aren't keyboard-reachable** because they're `<a>` without `href` or a `<div onClick>`. Product cards are `<article onClick>`, so product pages can't be reached by keyboard. "Wholesale" links to the Contact tab without selecting it. |
| Footer | **All 12 links are `href="#"`** (FAQ, Shipping, Returns, Blog, Press and so on). |
| Policies | There are no shipping, returns, privacy or terms pages. |
| 404 | Works, but it has a 3 s infinite bobbing animation and isn't marked `noindex`. |
| Mobile (390 px) | **The page scrolls 38 px sideways** on Home, Product, About and Contact. The footer grid's responsive class is on the wrong element. |

## 3. Audit table

Status key: ✅ Done · 🟡 Partial · 🔴 Broken / missing · ⚪ Not started
Priority key: **P0** = launch blocker · **P1** = needed for a credible launch · **P2** = improvement

| Area | Current implementation | Evidence | Status | Remaining work | Priority |
|---|---|---|---|---|---|
| **Order capture** | Checkout UI only; "Place Order" fires a toast | No requests in the network log; `CheckoutPage.jsx:56-60` | 🔴 | Server endpoint that validates, re-prices, saves, notifies the business and returns an order number | **P0** |
| **Server-side validation & pricing** | None; totals come from `parseInt(price.replace('₹',''))` in the browser | `CartContext.jsx:36` | 🔴 | Catalogue is the single source of truth on the server; integer paise; reject unknown SKUs and quantities | **P0** |
| **Backend** | Empty `index.js`; deps installed and `node_modules` committed | `wc -c backend/index.js` → 0 | 🔴 | Express API: orders, enquiries, health; Mongo persistence; rate limiting; tests | **P0** |
| **Payments** | COD label only; "Razorpay coming soon" | `CheckoutPage.jsx:447-458` | ⚪ | Decide COD-only vs Razorpay. If Razorpay: client account and keys, server order creation, signature and webhook verification, idempotency | P0 if online payment is a launch requirement |
| **Contact & wholesale forms** | Client validation only; toast then discard | `ContactPage.jsx:90-106` | 🔴 | POST to API; spam protection; email notification | **P0** |
| **Product imagery** | Hot-linked Unsplash stock; 3 broken, 1 strawberry, 1 watermelon | Screenshots `product-1440.png`, `home-products-1440.png` | 🔴 | Remove wrong images now; client to supply real product and packaging photos | **P0** |
| **Content accuracy / claims** | Health benefits ("boosts immunity", "anti-inflammatory", "relieves cold symptoms"), "Organic" tag, "Lab tested", "500+ customers", "8+ varieties" (catalogue has 3), strike-through "original" prices with "Save 20%", "Limited" tag, "award-winning", team bios with a name mismatch ("Jaya Prakash Reddy … Ravi taught us") | `products.js`, `Hero.jsx:94`, `AboutPage.jsx:13-33`, `Features.jsx` | 🔴 | Remove anything unverified. Health claims on food are regulated in India (FSSAI Advertising & Claims Regs 2018), and "organic" needs certification. The client must confirm the rest. | **P0** |
| **Legal & policy pages** | None; the footer links are `#` | Footer markup | 🔴 | Shipping, returns/refunds, privacy and terms pages. The client must approve the policy terms. Indian e-commerce rules require seller and grievance details. | **P0** |
| **Brand & visual design** | Generic template: forest green, `#f5a623` orange, Playfair/Inter, emoji as icons, a CSS "jar" blob, rounded cards everywhere | Screenshots; green isn't in the logo | 🟡 | Design system aligned to the logo (gold and chocolate), purposeful type, real composition | P1 |
| **Design tokens / CSS architecture** | ~1,700 lines of inline styles; 11 colour tokens; hover via JS `onMouseEnter` | `src/**/*.jsx` | 🔴 | Tokenised CSS (colour, type, space, radius, shadow, motion); remove inline styling | P1 |
| **Accessibility** | Primary buttons have **2.03:1** contrast (white on `#f5a623`). Labels aren't associated with inputs. No visible focus styling beyond the browser default. Nav isn't focusable. Icon buttons have no names. The drawer isn't a dialog. Infinite animations ignore `prefers-reduced-motion`. | Contrast script; Playwright tab sequence; `input.labels.length === 0` for every checkout field | 🔴 | WCAG 2.2 AA pass: contrast, labels, focus, keyboard, dialog semantics, reduced motion, error announcement | **P0** (legal/usability) |
| **SEO** | One static `<title>` for every route. No canonical, sitemap or robots. Relative `og:image` (an icon). The manifest has an empty `name`. `keywords` meta. | `index.html`; title check on `/product/p3` | 🔴 | Per-route title, description and canonical; prerendered HTML; sitemap; robots; OG image; Product + Organization JSON-LD (accurate only) | P1 |
| **Performance** | 454 KB JS (137 KB gzip) in one chunk, mostly framer-motion. Google Fonts via CSS `@import` (render-blocking chain). Remote 800 px images with no `srcset`. Content hidden until JS animates it. | `vite build` output | 🟡 | Drop framer-motion for CSS; self-host fonts; prerender; responsive images; lazy-load below the fold | P1 |
| **Security** | No backend, so no server attack surface yet. `react-router` has **2 high** advisories. A personal Gmail and phone number are hard-coded in components. | `npm audit` | 🟡 | Patch deps; API hardening (helmet, CORS allow-list, body limits, rate limits, input validation, no PII in logs); config via env | P1 |
| **Cart persistence & stock** | In-memory only; `inStock` field never read | Reload test | 🔴 | Persist to `localStorage` with versioning; reconcile against the catalogue; disable add-to-cart when out of stock (also enforced on the server) | P1 |
| **Code quality** | `npm run lint` → **13 errors**. Unused Vite template files (`App.css`, `hero.png`, `favicon.svg`, `icons.svg`). Duplicated tag colours, price parsing and form styles. | Lint output | 🟡 | Lint clean; shared components (Button, Field, Price, ProductArt); delete dead files | P1 |
| **Testing** | None (`"test": "echo Error…"`) | `backend/package.json` | ⚪ | API tests (validation, pricing, idempotency, rate limit); unit tests (cart, money); browser smoke test of the purchase journey | **P0** for order logic |
| **Deployment** | None. No env example, no hosting config, no SPA fallback. The Node version is unpinned (Vite 8 needs ≥20.19; this machine defaulted to 20.18). | Build warning | ⚪ | `.nvmrc`, env examples, static host config with SPA fallback and headers, API hosting guide, rollback | P1 |
| **Monitoring / ops** | None | — | ⚪ | Structured logs without PII, `/health`, error-reporting hook, backup guidance | P2 |
| **Client content management** | Developer-edited JS file | `products.js` | 🟡 | One documented catalogue file used by both frontend and API. A CMS is optional later. | P2 |
| **Admin / order management** | None | — | ⚪ | Launch: email notification and the MongoDB data browser. Later: admin UI or a commerce platform. | P2 |

## 4. Where the project is, in plain language

You have a **clickable front-end prototype**. It looks like a shop, but it can't take an order. A customer who checks out today is told the order is placed, and the order disappears. The same is true of the contact and wholesale forms. Three of the four product photos are broken, and the fourth shows a strawberry. The backend is an empty file. The words make medical and certification claims that nobody appears to have verified.

What is genuinely there: the route structure (Home, Product, About, Contact, Checkout, 404), a working in-memory cart, checkout form layout with basic validation, and a WhatsApp contact link. All of these are useful starting points.

### Completion estimate

**Scope:** "ready for production launch as a small direct-to-consumer honey store". That means real orders reach the business, the content is accurate, the site is accessible, findable and deployable, and the client can maintain it.

| Area | Weight | My estimate of done | Contribution |
|---|---:|---:|---:|
| Order capture & payments | 20% | ~0–5% | ~0–1 |
| Storefront pages & journeys | 15% | ~50–60% | ~8–9 |
| Brand & visual design | 15% | ~25–35% | ~4–5 |
| Content accuracy & policies | 15% | ~15–25% | ~2–4 |
| Accessibility | 8% | ~15–25% | ~1–2 |
| SEO | 7% | ~10–20% | ~1 |
| Performance | 5% | ~35–45% | ~2 |
| Security & operations | 5% | ~0–10% | ~0–0.5 |
| Testing | 5% | 0% | 0 |
| Deployment & handoff | 5% | ~0–5% | ~0 |
| **Total** | 100% | | **≈ 18–25%** |

**How certain this is:** the per-area figures are my judgement, not measurements. What I *verified* is that the order path, forms, images, keyboard access, contrast and mobile overflow fail, and that the build succeeds. What I *assumed* is that the client wants a transactional store rather than an enquiry site. A brochure site would put the figure much higher, around 45–55%, because order capture would drop out of scope. The weighting is mine and you can change it.

## 5. Delivery blockers that need the client

1. **Order and payment model.** Do they want COD order requests, Razorpay online payment, or a hosted platform? This decides the scope of the backend.
2. **Real product photography** and packaging (jar, label, sizes). Nothing usable exists in the repo.
3. **Verification of every claim**: origins, "raw/unfiltered", the processing temperature, lab testing, organic status, customer numbers, team bios and awards.
4. **Final prices**, and whether the "original price" discounts are genuine.
5. **Legal/business details**: legal entity name, address, FSSAI licence number, GSTIN (if registered), grievance officer contact, and the shipping, returns and refund terms.
6. **Business contact details.** The site currently uses a personal Gmail and mobile number. Confirm these are the intended public contacts.
7. **Logo in vector format** (SVG/PDF) and confirmation that the ® mark is registered.
8. **Accounts**: domain DNS, hosting, MongoDB Atlas (or another database), an email-sending account and, if chosen, Razorpay.
