# ohoney

Storefront and order system for **ohoney**, a raw honey brand based in Hyderabad. Customers order with cash on delivery; online payment through Razorpay is built and switched off.

| Folder | What it is |
|---|---|
| `frontend/` | React 19 + Vite storefront. Every page is prerendered to static HTML at build time. |
| `backend/` | Express 5 + MongoDB API for orders and enquiries. In production it also serves the built storefront. |
| `shared/` | Product catalogue, prices, delivery rules and form validation, used by both. |
| `docs/` | Audit, plan, design system, QA report and client handoff. |

## Quick start

Requires Node 22 (`nvm use`).

```bash
npm ci --prefix frontend && npm ci --prefix backend
npm run dev --prefix backend     # API on :8787 (in-memory store without MONGODB_URI)
npm run dev --prefix frontend    # site on :5173, proxies /api to :8787
```

| Command (repo root) | Does |
|---|---|
| `npm test` | All test suites (shared, frontend, backend). Set `MONGODB_TEST_URI` to include the MongoDB integration tests. |
| `npm run lint` | ESLint |
| `npm run build` | Install, build and prerender the site, and install the API's production dependencies |
| `npm start` | Start the API, which also serves the site in production |

Environment variables are described in `backend/.env.example` and `frontend/.env.example`.

**Deployment:** pushing `main` deploys to www.ohoney.in on Vercel (`frontend/vercel.json`: static pages plus the API as a Vercel Function). See [Client handoff §5](docs/CLIENT_HANDOFF.md#5-deploying).

## Documentation

- [Client handoff](docs/CLIENT_HANDOFF.md): deployment, content editing, operations, costs, launch checklist
- [QA report](docs/QA_REPORT.md): what was tested, how, and the results
- [Design system](docs/DESIGN_SYSTEM.md): tokens, type, components, asset rights
- [Project audit](docs/PROJECT_AUDIT.md): the starting point and the progress since
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md): scope decisions and backlog
