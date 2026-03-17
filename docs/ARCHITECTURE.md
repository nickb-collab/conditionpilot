# ConditionPilot — System Architecture

## High-Level Flow

```
Underwriter/LOS → Conditions → ConditionPilot → Document Request (Email/SMS)
                                                      ↓
Borrower ← Upload Portal ← Secure Link ← Request
    ↓
Upload → AI Classification → Processor Review Panel → Condition Cleared → LOS (read-only)
```

## Core Services

| Service | Responsibility |
|---------|----------------|
| **Condition service** | CRUD conditions, status, mapping to documents |
| **Document service** | Uploads, storage, metadata, link generation |
| **Messaging service** | Email (SendGrid), SMS (Twilio), reminder scheduling |
| **AI classification service** | Document type, date coverage, completeness |

## Database Schema (PostgreSQL/Supabase)

### Core Tables

```sql
-- Users (processors, LOAs, loan officers, ops)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,  -- processor, loa, loan_officer, ops
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Loans (from LOS or manual/CSV)
loans (
  id UUID PRIMARY KEY,
  los_loan_id TEXT,
  borrower_name TEXT NOT NULL,
  stage TEXT NOT NULL,  -- e.g. underwriting
  assigned_processor_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Borrowers (contact for a loan)
borrowers (
  id UUID PRIMARY KEY,
  loan_id UUID REFERENCES loans(id),
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Conditions (extracted or manual)
conditions (
  id UUID PRIMARY KEY,
  loan_id UUID REFERENCES loans(id),
  source TEXT,  -- los_api, upload, manual
  raw_text TEXT,
  document_type TEXT,
  metadata JSONB,  -- e.g. account ending, quantity
  status TEXT NOT NULL,  -- pending, requested, received, needs_review, cleared, rejected
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Documents (uploaded files + AI result)
documents (
  id UUID PRIMARY KEY,
  condition_id UUID REFERENCES conditions(id),
  file_key TEXT NOT NULL,  -- S3/key
  file_name TEXT,
  mime_type TEXT,
  ai_document_type TEXT,
  ai_date_coverage JSONB,
  ai_completeness TEXT,
  review_status TEXT,  -- pending_review, approved, rejected
  review_notes TEXT,
  uploaded_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
);

-- Outbound messages (email/SMS + reminders)
messages (
  id UUID PRIMARY KEY,
  loan_id UUID REFERENCES loans(id),
  condition_id UUID REFERENCES conditions(id),
  channel TEXT,  -- email, sms
  recipient TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ,
  reminder_sequence INT  -- 0=initial, 1=24h, 2=72h, etc.
);

-- Audit (compliance / RBAC)
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ
);
```

## Frontend Structure (Next.js)

```
app/
  (auth)/
    login/
  (dashboard)/           # Processor / LOA / LO
    dashboard/           # Loan dashboard
    loans/[id]/          # Loan detail + conditions
    conditions/[id]/     # Condition detail
    review/              # Processor review panel
  portal/                # Borrower-facing (no auth or token-based)
    upload/[token]       # Secure upload by link
```

## Security

- **Storage:** S3 with encryption at rest; HTTPS only (encryption in transit).
- **Borrower links:** Short-lived, signed tokens (e.g. JWT or signed URL) for upload portal.
- **Access:** RBAC by role (processor, LOA, loan officer, ops).
- **Audit:** Log sensitive actions to `audit_logs`.
- **PII:** Treat all borrower/loan data as PII; align with SOC 2 / GLBA readiness.

## Integrations (MVP)

- **LOS:** Read-only; optional CSV import and manual loan/condition entry for v1.
- **SendGrid:** Transactional email for document requests and reminders.
- **Twilio:** SMS for requests and reminder schedule (24h, 72h, 5d, final).

## Compliance Boundary

- **No** loan disclosures, **no** underwriting decisions, **no** loan term changes.
- **LOS = system of record.** ConditionPilot is workflow automation only.
