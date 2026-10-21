# ohoney — Client Handoff

**Prepared:** 21 Oct 2026 · **Updated:** 22 Oct 2026, merged to `main` and deployed to Vercel

## Verdict

**Live on www.ohoney.in (deployed 22 Oct 2026 at the owner's request), but not yet complete for production.**

- **Works now:** the new design, every page, the cart, and checkout. Until the database and email are configured, checkout sends orders by **WhatsApp** (§5).
- **Activates once MongoDB and SMTP variables are added in Vercel:** online ordering, with orders saved and emailed. No code changes are needed.
- **Still outstanding:**
  - confirmation of the claims and facts (§6);
  - legal details, including the FSSAI licence, which currently show as yellow "[To be provided]" markers on the live site;
  - real photos;
  - a Vercel Pro plan for commercial use.

---

## 1. What changed

| | Before | Now |
|---|---|---|
| Ordering | "Place Order" sent nothing, so every order was lost | Orders are validated and priced on the server, saved to MongoDB and emailed to the business and customer, with an order number. Duplicates are impossible. |
| Contact and wholesale forms | Showed success, sent nothing | Saved and emailed, with spam protection |
| Product images | 3 broken; the 4th showed a strawberry and a watermelon | Honest illustrations of each honey's colour, swapped automatically for real photos when supplied |
| Brand | Generic template, off-brand green, emoji icons | A design system built on the logo's own gold and chocolate (see `DESIGN_SYSTEM.md`) |
| Claims | Unverified health benefits, "Organic", "Lab tested", fake discounts, "500+ customers" | Removed until confirmed (see §6) |
| Pages | 6 routes, footer links all `#` | 15 page types: shop, product, story, wholesale, contact, FAQ, 4 policies, checkout, confirmation, 404. All links work. |
| Accessibility | Buttons at 2:1 contrast; nav and products unreachable by keyboard | axe: 0 violations on 33 page states. Full keyboard purchase verified. |
| SEO | One title for every page; no sitemap | Each page prerendered with its own title, description, canonical, social image and structured data; sitemap and robots |
| Backend | Empty file, with `node_modules` committed | Express + MongoDB API, 46 automated tests, security-reviewed |

Before-and-after screenshots: `docs/screenshots/before/` and `docs/screenshots/after/`.

---

## 2. How it fits together

```
frontend/   React + Vite storefront. `npm run build` prerenders every page to static HTML.
backend/    Express API (/api/*). In production it also serves the built storefront.
shared/     Product catalogue, prices, delivery rules and form validation, used by both.
docs/       This handoff, audit, plan, design system, QA report.
```

A single Node service runs everything on one domain. Orders are stored in MongoDB, and emails go out over SMTP.

## 3. Running it locally

Requirements: Node 22 (see `.nvmrc`). MongoDB and SMTP are optional locally.

```bash
npm ci --prefix frontend && npm ci --prefix backend
cp backend/.env.example backend/.env       # optional: add MONGODB_URI / SMTP settings
npm run dev --prefix backend               # API on http://localhost:8787
npm run dev --prefix frontend              # site on http://localhost:5173 (proxies /api)
npm test                                   # all test suites
```

Without `MONGODB_URI`, orders are kept in memory and lost on restart. Without SMTP, emails are logged as "not sent". Both are fine for development; production refuses to start without them.

## 4. Environment variables

These are names only. **Real values go in the hosting dashboard and are never committed.** Full descriptions are in `backend/.env.example` and `frontend/.env.example`.

| Variable | Needed | Purpose |
|---|---|---|
| `NODE_ENV` | Yes (`production`) | Turns on production safety checks |
| `MONGODB_URI` | Yes | Database connection string |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Yes | Outgoing email server |
| `MAIL_FROM` | Yes | Sender, e.g. `ohoney <orders@ohoney.in>` |
| `ORDER_NOTIFY_EMAIL` | Yes | Inbox that receives orders and enquiries |
| `SITE_URL` | Yes | Public address, used in emails |
| `VITE_SITE_URL` | Yes, **at build time** | Canonical URLs, social previews and sitemap |
| `VITE_NOINDEX` | Staging only (`true`) | Keeps search engines off a staging site |
| `TRUST_PROXY` | Usually leave unset | Number of proxies in front of the app. Defaults to 1 in production. |
| `SMTP_SECURE`, `SMTP_REQUIRE_TLS` | Optional | TLS options. TLS is required by default in production. |
| `CORS_ORIGINS`, `VITE_API_URL` | Only for a split deployment | Different domains for site and API |
| `PAYMENTS_RAZORPAY_ENABLED`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Only when going live with online payment | Razorpay |
| `ALLOW_NO_EMAIL` | Never in production | Allows a private staging site without email |

## 5. Deploying

### Current host: Vercel (ohoney.in)
`www.ohoney.in` is served by **Vercel**, which deploys automatically when `main` is pushed to GitHub. The apex `ohoney.in` redirects to `www`. Other branches get preview deployments. `frontend/vercel.json` configures everything else:
- install and build, including the shared catalogue and the API's dependencies;
- `/api/*` runs the Express API as a Vercel Function (`frontend/api/index.js`), in the Mumbai region `bom1`;
- security headers (CSP), immutable caching for assets, and 301 redirects from old `/product/p1`-style links.

The Vercel project settings that must stay as they are:
- **Root Directory:** `frontend`.
- **"Include files outside the root directory in the Build Step":** enabled. The build needs `../shared` and `../backend`.

**Turning on online ordering (one-time setup):**
1. **MongoDB Atlas.** Create a cluster in **Mumbai (ap-south-1)**: Flex for production, because it includes backups. Create a database user with a long random password. Because Vercel's servers have no fixed IP addresses, allow network access from anywhere (`0.0.0.0/0`). Alternatively, add MongoDB Atlas from the Vercel Marketplace, which creates the connection variable for you.
2. **Email.** Use SMTP details from the domain mailbox or a sending service, and add its SPF, DKIM and DMARC records in GoDaddy DNS.
3. **Vercel → Project → Settings → Environment Variables (Production).** Add `MONGODB_URI`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and `ORDER_NOTIFY_EMAIL`. `SITE_URL` is optional; it defaults to `https://www.ohoney.in`.
4. **Redeploy:** Deployments → latest → Redeploy.
5. **Check:**
   - `https://www.ohoney.in/api/health` returns `{"status":"ok"}`;
   - place a real COD order to yourself and confirm both emails arrive.

**Until step 3 is done**, the site is fully browsable, but `/api/*` answers "unavailable". Checkout then offers **"Send this order on WhatsApp"**, with the items, total and address pre-filled, so orders still reach the business. The contact form shows the email address instead.

**The Vercel plan.** Vercel's Hobby (free) plan is for **non-commercial, personal use only**, and a shop is commercial use. Move the project to **Pro**, about US$20 per user per month (check vercel.com/pricing).

**Rollback.** Vercel → Deployments → choose the previous production deployment → **Promote to Production**. This is instant. Alternatively, `git revert` the change and push.

**Serverless limitations:**
- Rate limits are counted per function instance, so they are weaker than on a single server.
- The first request after a quiet period connects to MongoDB, which adds a cold start of about a second.

### Alternative: one Node server (Render, Railway, Fly.io or a VPS)
- Build command: `npm run build`. Start command: `npm start`. Health check: `/api/health`.
- Set the variables from §4 (`NODE_ENV=production` and `VITE_SITE_URL` at build time).
- This option gives the strongest rate limiting and has no cold starts. Atlas backups and rollback work as above.

**Staging.** Vercel preview deployments, made automatically for every branch, can serve as staging. Set `VITE_NOINDEX=true` for the Preview environment so search engines skip them.

**Restoring data.** Atlas → cluster → Backup → restore a snapshot. Run a test restore once before relying on it.

## 6. Content the client must confirm

Everything below is on the site **as written by the previous developer**, and nobody has verified it. **Nothing marked ❗ may go to production unconfirmed.**

### Claims shown on the site, to confirm
| ❗ | Claim | Where |
|---|---|---|
| ❗ | The honey is **raw** | Everywhere (headline, titles, emails) |
| ❗ | "Packed in **small batches**" | Homepage |
| ❗ | Origins: Wildflower from the **Nilgiri Hills, Tamil Nadu**; Eucalyptus from **Mysore, Karnataka**; Forest from the **Western Ghats, Kerala** | Product pages, homepage, story |
| ❗ | Taste and character descriptions, and the "Good for" uses | Product pages |
| ❗ | Ingredients: "Honey" | Product pages |
| ❗ | Prices: ₹399 / 500 g, ₹349 / 300 g, ₹299 / 250 g, ₹499 sampler (3 × 100 g, gift box) | `shared/catalog.js` |
| ❗ | Supermarket honey is often "heated, filtered and blended" (a comparative statement) | Our story |
| ❗ | "Every jar is exactly what the label says"; "beekeepers we know" | Our story |
| | Honey colours in the illustrations are approximate | Product art |

### Removed: re-add only with evidence
Each of these needs proof: a lab report, a certificate, or records. Health claims on food are regulated in India by the FSSAI (Advertising and Claims) Regulations, 2018, and "organic" needs certification.
- Health benefits: "boosts immunity", "anti-inflammatory", "soothes sore throat", "relieves cold symptoms", "great for skin", "respiratory health", "antioxidants", "natural energy booster"
- "Organic", "Lab tested", "never heated above 40 °C", "unfiltered", "sustainably sourced", "no plastic, ever", "100% recyclable", "fair to farmers / above market rate"
- "500+ happy customers", "8+ varieties" (the catalogue has 3), "award-winning Forest Honey", "Best seller", "Limited"
- Strike-through "original" prices and "Save 20%". Discounts must be genuine to show.
- Nutrition figures. Use the values from the printed label.
- Team bios (one bio named "Ravi" under a different person's name) and the 2019/2021/2023 founding timeline

### Service details to confirm
- Delivery in **3 to 5 working days**, India only
- Delivery fee: **₹60**, free from **₹499**
- Payment: cash on delivery, with every order confirmed by call or WhatsApp before dispatch
- Business hours: Mon–Sat 9 am–6 pm, Sun 10 am–2 pm
- Reply times: contact within 24 hours, wholesale within 48 hours
- **Public contact details:** `ejpreddy@gmail.com` and +91 93462 36425. These look personal; consider an `orders@ohoney.in` address.
- Wholesale: minimum 10 kg; custom labels above 50 kg

### Legal details (shown as yellow "[To be provided]" markers until filled)
Fill these in `frontend/src/content/site.js` → `legal`:
- legal entity name and registered address;
- **FSSAI licence number**, which must be displayed by a food business selling online;
- GSTIN, or remove that line if not registered;
- grievance officer's name and email;
- number of days to report a damaged item;
- the city whose courts have jurisdiction.

### Policy wording to approve
These are proposals, not facts: refunds paid within **7 working days** by bank transfer or UPI; no returns on opened jars; enquiries deleted after about **12 months**; tracking details sent by email or WhatsApp; prices include taxes. **Ideally have a lawyer review the four policy pages** (`/shipping`, `/returns`, `/privacy`, `/terms`).

## 7. Client assets still needed
1. **Product photography** of the real jars and packaging, for each product and the sampler. Ideally 1600 × 2000 px, 4:5 portrait, JPEG or WebP under 300 KB.
2. **Logo as a vector** (SVG or PDF), plus confirmation that the ® mark is registered.
3. Optionally, real photos of the apiaries or beekeepers, with permission to use them.

**To add photos:** put the files in `frontend/public/images/`, then add them to the product in `shared/catalog.js`:
```js
images: [{ src: '/images/wildflower-500g.jpg', alt: 'Wildflower Honey 500 g jar', width: 1600, height: 2000 }],
```
The illustrations are replaced automatically, and the structured data then uses the photo.

## 8. Editing content day to day

Edits are made in plain files. Each change is committed and pushed, and the host redeploys automatically.

| To change | Edit |
|---|---|
| Prices, products, sizes, descriptions, "out of stock" (`available: false`) | `shared/catalog.js` |
| Delivery fee or free-delivery threshold | `shared/catalog.js` → `SHIPPING` |
| Phone, email, hours, delivery time, legal details | `frontend/src/content/site.js` |
| FAQ | `frontend/src/content/faq.js` |
| Policies | `frontend/src/content/policies.js` |
| Page wording | `frontend/src/pages/*.jsx` |

Prices are safe to change at any time. A customer with an old page open is told "prices have changed" and is never charged the old amount.

A content management system (CMS) for non-developers is a possible later addition; see §11.

## 9. Running the shop

1. A new order arrives as an email: **"New order OH-261021-2HAW: ₹798 (COD)"**. It contains the customer's phone number, address and items. Replying goes straight to the customer.
2. Call or WhatsApp the customer to confirm, then dispatch and collect cash on delivery.
3. If an order's subject starts **[CHECK: possible spam]**, the spam trap was triggered. Confirm by phone before dispatching.
4. Every order is also stored in MongoDB. View it in Atlas → Browse Collections → `orders`. The developer can run `npm run orders -- list` to list orders.
5. **If email ever fails**, orders are still saved. The developer runs `npm run orders -- resend-failed` to re-send. Watch for "email failed" in the host's logs (see §10).

## 10. Maintenance

- **Monthly:** run `npm audit` in `frontend/` and `backend/`, update dependencies, and re-run `npm test`. CI (`.github/workflows/ci.yml`) runs the tests on every push.
- **Recommended monitoring.** None of these are set up yet:
  - a free uptime check on `https://ohoney.in/api/health`;
  - a log alert on the words `email failed` and `unhandled error`;
  - Search Console with the sitemap submitted.
- **Backups:** Atlas Flex takes daily snapshots. Run a test restore once. Optionally export monthly with `mongodump`.
- **Security:** keep all secrets in the host dashboard only, rotate the database and SMTP passwords if anyone leaves, and keep `TRUST_PROXY` matched to the host (see `.env.example`).

## 11. Ongoing costs

These are approximate, gathered in October 2026 from public sources that don't all agree. **Check each provider's pricing page when signing up.**

| Item | Approx. cost | Notes |
|---|---|---|
| Web hosting: **Vercel Pro** (current host) | ~US$20 / user / month | Hobby (free) is limited to non-commercial use |
| *or* a single Node host (e.g. Render Starter) | ~US$7 / month | An always-on instance. Free tiers sleep. |
| MongoDB Atlas Flex | ~US$8–30 / month | Includes automatic daily backups. The free M0 tier is for staging only. |
| Email sending | Free to low | Brevo's free plan is listed at 300 emails/day; a domain mailbox costs per user |
| Domain `ohoney.in` | Annual renewal | Depends on the registrar |
| Razorpay (only when switched on) | ~2% + 18% GST on the fee, per domestic payment | No setup fee under standard pricing, per Razorpay's own published material |
| **Typical total at launch** | **~US$30–50 / month on Vercel Pro**, or ~US$15–40 on a single Node host, plus domain and email | Excludes development time |

## 12. Online payment (Razorpay), when wanted

The code is ready and tested with a simulated Razorpay. To switch it on:
1. The client opens and KYC-verifies a Razorpay account. In **test mode**, copy the key ID and key secret.
2. In Razorpay → Webhooks, add `https://<site>/api/webhooks/razorpay` with the events `payment.captured`, `order.paid` and `payment.failed`. Set a webhook secret.
3. Make sure auto-capture is enabled in Razorpay's payment settings.
4. Set `PAYMENTS_RAZORPAY_ENABLED=true` and the three `RAZORPAY_*` variables on **staging**, and place test payments: success, failure and closing the window.
5. Repeat with live keys in production. **This takes explicit client approval, because real money moves.**

## 13. Known limitations

- **There is no admin screen.** Order status is managed by phone and email. The database status can be edited in Atlas.
- **Stock** is a simple on/off flag per product, not counted inventory.
- There are no discount codes and no customer reviews. Reviews need a genuine collection process.
- Rate limits are per server instance, which is fine for a single instance.
- There's no CDN. The single service serves everything, which is adequate for the expected traffic of a small shop.
- Only Chromium was tested. **Test on a real iPhone (Safari) and an Android phone before launch.**
- **This is not "enterprise-ready", and we don't claim it.** That would need load testing, an uptime target with alerting, a rehearsed backup restore, an incident runbook and multi-instance rate limiting.

## 14. Launch checklist

Status key: ✅ complete · ⛔ blocked on client · ⏸ deferred

| Requirement | Status |
|---|---|
| Orders captured, priced on the server, stored, emailed, duplicate-safe | ✅ |
| Contact and wholesale enquiries delivered | ✅ |
| Cart persists; accessible drawer; keyboard-complete checkout | ✅ |
| Shop, product, story, FAQ, policy, confirmation and 404 pages | ✅ |
| WCAG 2.2 AA automated checks (axe) clean; contrast verified | ✅ |
| Prerendered SEO: titles, canonicals, OG images, sitemap, robots, structured data | ✅ |
| Security review findings fixed; dependencies at 0 known vulnerabilities | ✅ |
| Automated tests (71) and CI workflow | ✅ (CI not yet run on GitHub) |
| Deployment, rollback and backup documentation | ✅ |
| Confirm the claims and facts in §6 | ⛔ |
| Legal details, including the FSSAI licence number | ⛔ |
| Approve the policy wording, ideally with legal review | ⛔ |
| Product photography and vector logo | ⛔ (the site works without them, using illustrations) |
| Public business email and phone confirmed | ⛔ |
| Site deployed to www.ohoney.in (Vercel) | ✅ see §5 (ordering falls back to WhatsApp until the database and email variables are set) |
| MongoDB Atlas + SMTP variables in Vercel; email DNS (SPF, DKIM, DMARC) | ⛔ |
| Vercel plan upgraded to Pro (commercial use) | ⛔ |
| Client review of the live site | ⛔ |
| Real-device testing on iOS Safari and Android Chrome | ⛔ (can now be done on www.ohoney.in) |
| Uptime and log alerts; Search Console | ⏸ (recommended at launch) |
| Razorpay online payment | ⏸ (code ready; needs the client's account and approval) |
| Admin screen, inventory counts, discount codes, reviews, CMS | ⏸ (future) |

**Next steps:**
1. The client works through §6 and §7.
2. Create the hosting, database and email accounts.
3. Deploy to staging with `VITE_NOINDEX=true`.
4. Client review, then real-device testing.
5. Production deploy, after the client's explicit go-ahead.
