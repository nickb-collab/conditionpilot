# Product Requirements Document (PRD)

**Product Name:** ConditionPilot (placeholder)  
**Summary:** AI assistant that manages underwriting conditions, borrower document requests, and processor workflows.

---

## 1. Problem Statement

Mortgage processors spend **30–50%** of their time managing underwriting conditions and chasing borrower documents.

**Current workflow:**
1. Underwriter issues conditions
2. Processor manually copies conditions
3. Processor emails borrower
4. Borrower uploads wrong documents
5. Processor reviews manually
6. Processor updates LOS
7. Repeat until cleared

**This creates:**
- Slow loan turn times
- Operational inefficiency
- Frustrated borrowers
- Overwhelmed processors

---

## 2. Product Vision

Provide an **AI assistant** that manages the condition lifecycle automatically. The platform should:

- Extract underwriting conditions
- Request borrower documents automatically
- Verify uploaded documents
- Track condition status
- Remind borrowers automatically

**Goal:** Reduce processor workload by **30–50%.**

---

## 3. Target Users

| Role | Description |
|------|-------------|
| **Primary** | Mortgage Processors — daily file management and document chasing |
| **Primary** | Loan Officer Assistants (LOA) — help manage loan pipelines |
| **Primary** | Loan Officers — visibility into loan progress |
| **Secondary** | Operations Managers — monitor pipeline health |

---

## 4. MVP Scope (First Release)

**One core workflow:**  
Condition → Document Request → Document Verification → Condition Cleared

---

## 5. Core Features

### 5.1 Loan Dashboard

Displays all active loans assigned to a processor.

| Field | Example |
|-------|---------|
| Borrower name | Smith |
| Loan ID | — |
| Loan stage | underwriting |
| Open conditions | 6 |
| Missing documents | 2 |
| Next borrower action | — |
| Last borrower response | — |
| Status | waiting borrower |

### 5.2 Condition Extraction

**Sources:**
- LOS API
- Uploaded underwriting condition document
- Manual entry

Conditions are converted into **structured tasks**.

**Example:**

- **Condition text:** “Provide two most recent bank statements for account ending 4582.”
- **Converted to:**
  - Document Type: Bank Statement
  - Account: 4582
  - Quantity: 2
  - Status: Pending

### 5.3 Borrower Document Request Engine

Automatically sends borrower requests.

**Channels:** email, SMS, borrower upload portal

**Request includes:**
- Secure upload link
- Document instructions
- Due date

*Example:* “Your lender needs your two most recent bank statements. Upload them here.”

### 5.4 Borrower Upload Portal

- Drag and drop upload
- Mobile upload support
- File preview
- Upload confirmation

**Accepted formats:** PDF, JPG, PNG

### 5.5 AI Document Classification

When borrower uploads a file, AI analyzes:
- Document type
- Date coverage
- Completeness

**Example:** Upload → Bank Statement  
System verifies: correct document type, correct date range, correct borrower name → marks condition: **Received → Ready for Processor Review**

### 5.6 Automated Borrower Follow Ups

**Reminder schedule:** 24h, 72h, 5 days, final reminder

*Example SMS:* “Reminder: your lender still needs your updated paystub to move forward with your loan.”

### 5.7 Condition Status Tracking

**Statuses:** Pending | Requested | Received | Needs Review | Cleared | Rejected

Processors can override status manually.

### 5.8 Processor Review Panel

- Approve document
- Reject document
- Request additional docs

*Example reject reason:* “Bank statement missing page 3.”

---

## 6. System Architecture

### Frontend

**Stack:** React / Next.js

**Pages:**
- Loan dashboard
- Condition detail page
- Borrower portal
- Processor review panel

### Backend

**Stack:** Node.js or Python

**Services:**
- Condition service
- Document service
- Messaging service
- AI classification service

### Database

**Recommended:** PostgreSQL or Supabase

**Core tables:** Loans, Conditions, Documents, Borrowers, Messages, Users

### AI Layer

**Tasks:**
- Document classification
- Condition parsing
- Document completeness detection

**Possible models:** OpenAI, Claude, document vision models

### Storage

**Recommended:** AWS S3  
**Requirements:** encryption at rest, encryption in transit

---

## 7. Integrations

**MVP:**
- **LOS (read-only):** e.g. ICE Mortgage Technology Encompass, LendingPad  
  Initial version may use: CSV import, manual loan creation
- **Email:** SendGrid
- **SMS:** Twilio

---

## 8. Security Requirements

Mortgage data includes PII. Required:

- Encrypted document storage
- Role-based access control
- Audit logs
- Secure borrower upload links
- Multi-factor authentication

**Industry standards:** SOC 2, Gramm-Leach-Bliley Act compliance readiness

---

## 9. Compliance Guardrails

The system must **NOT:**

- Generate loan disclosures
- Modify loan terms
- Perform underwriting decisions

**The LOS remains the system of record.** The platform is a **workflow automation layer only.**

---

## 10. Analytics

Basic reporting:

- Number of open conditions
- Average time to clear condition
- Borrower response time
- Processor workload

---

## 11. Pricing Model (Potential)

| Option | Range |
|--------|--------|
| Per processor | $299–$499/month |
| Per loan file | $79–$129 |
| Enterprise | $3k–$15k/month per lender |

---

## 12. MVP Development Timeline

| Weeks | Focus |
|-------|--------|
| 1–2 | Core backend + database schema |
| 3–4 | Loan dashboard + condition engine |
| 5–6 | Borrower portal + upload system |
| 7–8 | AI document classification |

---

## 13. Success Metrics

**Primary:**
- Conditions cleared per processor
- Borrower response time
- Document submission rate

**Target:** Reduce processor time spent on document chasing by **40%.**

---

## 14. Future Features (Post-MVP)

- Automatic condition extraction from underwriting notes
- Pipeline bottleneck detection
- Borrower AI chat assistant
- Compliance alerts
- Document fraud detection
