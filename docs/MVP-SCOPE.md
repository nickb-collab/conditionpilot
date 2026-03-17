# MVP Scope — ConditionPilot

Single workflow for first release: **Condition → Request → Upload → Verify → Cleared.**

## In scope

| Feature | Description |
|--------|-------------|
| Loan dashboard | List loans with borrower, stage, open conditions, missing docs, status |
| Condition extraction | LOS API (if available), uploaded condition doc, or manual entry → structured tasks |
| Document request engine | Send email/SMS with secure upload link, instructions, due date |
| Borrower upload portal | Drag-and-drop, PDF/JPG/PNG, mobile-friendly, confirmation |
| AI document classification | Type, date coverage, completeness → “Ready for processor review” |
| Automated follow-ups | 24h, 72h, 5d, final reminder (email/SMS) |
| Condition status | Pending, Requested, Received, Needs Review, Cleared, Rejected (+ manual override) |
| Processor review panel | Approve / Reject / Request additional docs with notes |

## Out of scope (post-MVP)

- Full LOS write-back (we stay read-only / workflow layer)
- Loan disclosures, underwriting decisions, term changes
- Automatic condition extraction from freeform underwriting notes (v1 can be manual/upload)
- Pipeline analytics, bottleneck detection, borrower chat, fraud detection

## Data (MVP)

- **Loans:** From LOS read-only API or CSV import / manual create
- **Conditions:** From LOS, uploaded document, or manual
- **Documents:** Stored in S3; metadata + AI result in DB
- **Messages:** SendGrid + Twilio; log in `messages` table

## Success (MVP)

- Processors can see all loans and conditions in one dashboard
- Borrowers receive and complete document requests via link
- AI suggests document type/date/completeness; processor makes final call
- Fewer manual emails and follow-ups; target **~40%** reduction in time on document chasing
