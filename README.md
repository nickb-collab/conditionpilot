# ConditionPilot

AI assistant for mortgage underwriting conditions, borrower document requests, and processor workflows. Reduces processor time spent on document chasing by targeting **30–50%**.

## Quick links

- [PRD](./PRD.md) — Product requirements and MVP scope
- [Architecture](./docs/ARCHITECTURE.md) — System design, services, and DB schema

## MVP workflow

**Condition → Document Request → Document Verification → Condition Cleared**

1. **Loan dashboard** — Active loans, open conditions, missing docs, borrower status
2. **Condition extraction** — From LOS API, uploaded doc, or manual entry → structured tasks
3. **Borrower requests** — Email/SMS + secure upload link, instructions, due date
4. **Borrower portal** — Drag-and-drop upload (PDF, JPG, PNG), mobile-friendly
5. **AI classification** — Document type, date range, completeness → Ready for review
6. **Follow-ups** — Automated reminders (24h, 72h, 5d, final)
7. **Condition status** — Pending → Requested → Received → Needs Review → Cleared / Rejected
8. **Processor review** — Approve, reject, or request more docs

## Tech stack (recommended)

| Layer    | Choice              |
|----------|---------------------|
| Frontend | React / Next.js     |
| Backend  | Node.js or Python   |
| Database | PostgreSQL / Supabase |
| Storage  | AWS S3              |
| Email    | SendGrid            |
| SMS      | Twilio              |
| AI       | OpenAI / Claude / document vision |

## Repo structure (target)

```
conditionpilot/
├── PRD.md
├── README.md
├── docs/
│   └── ARCHITECTURE.md
├── frontend/          # Next.js app
├── backend/           # API + condition/document/messaging/AI services
├── packages/          # Shared types, config (optional)
└── infra/             # DB migrations, S3, env (optional)
```

## MVP timeline (from PRD)

| Weeks | Focus                          |
|-------|---------------------------------|
| 1–2   | Core backend + database schema  |
| 3–4   | Loan dashboard + condition engine |
| 5–6   | Borrower portal + upload system |
| 7–8   | AI document classification     |

## Compliance

- **No** disclosures, **no** underwriting decisions, **no** loan term changes.
- LOS is the system of record; ConditionPilot is workflow automation only.
- PII handled per SOC 2 / GLBA readiness (encryption, RBAC, audit logs).

## Getting started

1. Read [PRD.md](./PRD.md) and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
2. Set up PostgreSQL (or Supabase) and run schema from the architecture doc.
3. Implement backend services (conditions, documents, messaging, AI stub).
4. Build Next.js app: dashboard → condition detail → borrower portal → review panel.
5. Wire LOS (read-only or CSV/manual for v1), SendGrid, Twilio, and S3.
