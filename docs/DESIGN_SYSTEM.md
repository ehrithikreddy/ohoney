# ohoney Design System

**Direction: "Backlit amber."** Honey's most honest visual is its colour against light. The site shows the three honeys as backlit glass columns on a deep propolis-brown ground, arranged lightest to darkest. Everything else stays quiet: ivory paper, chocolate type, and the logo's gold reserved for primary actions.

The tokens live in `frontend/src/styles/tokens.css`, and the shared primitives (buttons, links, notices, layout) in `frontend/src/styles/base.css`. Each component keeps its own CSS file beside its `.jsx`.

## Principles

1. **One bold thing per screen.** The backlit honey is the memorable element; type, spacing and colour around it stay disciplined.
2. **True to the product.** Product art illustrates honey colour and never imitates packaging. Real photography replaces it automatically when added to the catalogue (see `CLIENT_HANDOFF.md`).
3. **The logo's colours.** Gold `#FBB715` and chocolate `#42290A` come from the client's logo. The previous forest green was off-brand and has been removed.
4. **Structure carries meaning.** Numbers appear only on real sequences ("How ordering works", the order confirmation steps). There are no decorative eyebrows, no all-caps labels and no arrows glued to buttons.
5. **Motion answers people.** There is one orchestrated moment, the honey filling the hero columns on load. Everything else is feedback on an action: opening the drawer, hovering a link, opening an FAQ. All of it is disabled under `prefers-reduced-motion`.

## Colour

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--c-ink` | `#2B1B0C` | Body text, headings, primary button text | 15.5:1 on paper |
| `--c-ink-soft` | `#6B5338` | Secondary text | 6.7:1 on paper, 6.0:1 on paper-deep |
| `--c-paper` | `#FBF7EE` | Page background (warm ivory) | — |
| `--c-paper-deep` | `#F3EAD6` | Tinted sections, summaries | — |
| `--c-gold` | `#FBB715` | Logo gold: primary buttons, highlights, underlines. **Never text on light.** | Ink on gold 9.4:1 |
| `--c-gold-hover` | `#F2A900` | Primary button hover | Ink on it 8.3:1 |
| `--c-amber` | `#8C4F07` | Links and small accents on light grounds | 6.1:1 on paper |
| `--c-propolis` | `#22150A` | Dark "backlit" panels, footer | Paper on it 16.7:1 |
| `--c-on-dark-soft` | `#CDB79A` | Secondary text on propolis | 9.2:1 |
| `--c-line` | `#E7DCC3` | Decorative hairlines | (decorative) |
| `--c-line-strong` | `#8F785A` | Form borders | 3.9:1 (non-text ≥3:1) |
| `--c-danger` | `#A3261A` | Errors | 6.9:1 on paper |
| `--c-success` | `#2E6A3A` | Success | 6.1:1 on paper |
| `--c-todo-bg` | `#FFF0B8` | "To be provided" markers for missing business details | — |

The ratios were computed with the WCAG 2.x relative-luminance formula. The previous site's primary buttons (white on `#F5A623`) measured **2.03:1**.

**Honey colours** are product data in `shared/catalog.js` (`colour.light/base/deep`), not tokens. They are illustrative and should be checked against the real honey.

## Typography

| Role | Face | Notes |
|---|---|---|
| Display (h1–h3, wordmark, product character lines) | **Fraunces Variable**, `SOFT` axis at 100 | The rounded, viscous terminals suit honey. Weight 500, or 600 for h3 and the wordmark. Self-hosted, 62 KB Latin. |
| Text, UI, prices | **Anek Latin Variable** (Ek Type, an Indian foundry) | Has a native ₹ glyph. Self-hosted, 45 KB Latin, plus 36 KB Latin-ext loaded only for ₹. |

The scale follows the classic series 14 · 17 · 21 · 24 · 36 · 48 · 72 px (`--step--1` to `--step-5`). The larger steps are fluid with `clamp()`. Body text is 17 px with a line height of 1.6. Prose is capped at 66 characters (`--measure`), and headings use `text-wrap: balance`.

Both Latin font files are preloaded on every page by `scripts/prerender.js`.

## Space, layout and shape

- **Space:** a 4 px base (`--space-1` 4 px to `--space-9` 96 px). Section rhythm uses `--section`, which is fluid from 64 to 120 px.
- **Containers:** `.container` is 76 rem with a fluid gutter from 16 to 40 px. `.container--narrow` is 46 rem, for reading pages.
- **Radius hierarchy:** `--radius-sm` (4 px) for buttons and inputs, which keeps them crisp and label-like. `--radius-md` (8 px) for product art and summary panels. The honey vessels are the only large curves.
- **Depth:** one overlay shadow (the drawer) and one honey glow. There are no card shadows.
- **Breakpoints:** content-led rather than device-led. The hero and product page stack below 52 rem, the range rows below 46 rem and the forms below 36 rem.

## Motion

| Token | Value | Used for |
|---|---|---|
| `--dur-fast` | 140 ms | Button and link colour |
| `--dur-base` | 240 ms | Hover lift, FAQ toggle |
| `--dur-slow` | 420 ms | Cart drawer slide |
| `--dur-pour` | 1400 ms | Hero honey fill, once, staggered 220 ms |

Under `prefers-reduced-motion: reduce` every duration becomes 0, the pour animation is removed and smooth scrolling is off. This was verified in the browser.

## Components

| Component | File | Notes |
|---|---|---|
| Buttons | `base.css` `.btn--primary/--secondary/--block/--small` | 48 px minimum height. Primary is ink on gold. |
| Quiet link | `.link-quiet` | Underlined in gold; for secondary actions beside a primary button. |
| HoneyVessel | `components/HoneyVessel.jsx` | SVG glass column. Takes `colour`, `fill`, `pour`, `delay`. |
| ProductArt | `components/ProductArt.jsx` | Uses the photo if `product.images[0]` exists; otherwise the vessel(s) on propolis. Variants: `card`, `hero`, `thumb`. |
| Field / ErrorSummary / Honeypot | `components/Field.jsx` | Associated labels, hints and errors via `aria-describedby`. The error summary links to each field and receives focus on a failed submit. |
| QuantityStepper | `components/QuantityStepper.jsx` | 44 px targets. Disabled at 1 and at the maximum. |
| Cart drawer, mobile menu | Native `<dialog>` | Focus trap, Escape and focus return come from the browser. Backdrop click closes them. |
| Notices | `.notice`, `--error`, `--success` | Gold, red or green left rule on a tinted ground. |
| To-be-provided marker | `RichText.jsx` `<Todo>` | Visible yellow marker wherever a legal or business detail is missing. |

## Writing

- Plain, warm, specific, in Indian English spelling (colour, flavour).
- Buttons say exactly what happens: "Add to cart", "Place order (₹798)", "Send enquiry".
- Errors say what to do: "Enter a 6-digit PIN code."
- **No claims without evidence:** no health benefits, certifications, customer counts or scarcity. See the claims checklist in `CLIENT_HANDOFF.md`.

## Asset sources and rights

| Asset | Source | Rights |
|---|---|---|
| Logo PNGs and favicons (`frontend/public/*.png`, `.ico`) | Supplied in the repo by the client | Client-owned. The ® mark is unverified. |
| Honey illustrations and Open Graph cards (`public/og/*.png`) | Created for this project in code (`HoneyVessel`, `scripts/og-template.html`) | Project-owned |
| Fraunces | Undercase Type, via Fontsource | SIL Open Font License 1.1 |
| Anek Latin | Ek Type, via Fontsource | SIL Open Font License 1.1 |
| Icons | Hand-drawn inline SVG (`components/Icon.jsx`) | Project-owned. The WhatsApp glyph is used only to link to WhatsApp. |
| Unsplash stock photos (previous site) | — | **Removed.** They showed a strawberry and a watermelon, and three no longer loaded. |
