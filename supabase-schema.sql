-- ConditionPilot Supabase Schema
-- Run this in the Supabase SQL editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- LOANS
-- =====================
create table if not exists loans (
  id text primary key,
  borrower text not null,
  loan_amount numeric not null,
  property text not null,
  stage text not null default 'Underwriting',
  open_conditions integer not null default 0,
  missing_docs integer not null default 0,
  next_action text,
  last_response text,
  status text not null default 'waiting_borrower' check (status in ('waiting_borrower', 'in_review', 'cleared', 'action_needed')),
  processor text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- CONDITIONS
-- =====================
create table if not exists conditions (
  id text primary key,
  loan_id text not null references loans(id) on delete cascade,
  text text not null,
  document_type text not null,
  status text not null default 'pending' check (status in ('pending', 'requested', 'received', 'needs_review', 'cleared', 'rejected')),
  requested_at text,
  received_at text,
  cleared_at text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- UPLOADED DOCUMENTS
-- =====================
create table if not exists uploaded_documents (
  id text primary key,
  condition_id text not null references conditions(id) on delete cascade,
  loan_id text not null references loans(id) on delete cascade,
  borrower text not null,
  filename text not null,
  uploaded_at text not null,
  type text not null,
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected')),
  ai_confidence integer,
  ai_issues text[] default '{}',
  date_range text,
  storage_path text,
  created_at timestamptz not null default now()
);

-- =====================
-- AI RULES
-- =====================
create table if not exists ai_rules (
  id uuid primary key default uuid_generate_v4(),
  document_type text not null,
  checks jsonb not null default '[]',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- NOTIFICATION SETTINGS
-- =====================
create table if not exists notification_settings (
  id uuid primary key default uuid_generate_v4(),
  reminder_days integer[] not null default '{1,3,5,14}',
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  email_template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger loans_updated_at before update on loans for each row execute function update_updated_at();
create trigger conditions_updated_at before update on conditions for each row execute function update_updated_at();
create trigger ai_rules_updated_at before update on ai_rules for each row execute function update_updated_at();
create trigger notification_settings_updated_at before update on notification_settings for each row execute function update_updated_at();

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table loans enable row level security;
alter table conditions enable row level security;
alter table uploaded_documents enable row level security;
alter table ai_rules enable row level security;
alter table notification_settings enable row level security;

-- Allow all authenticated users to read/write (you can tighten this later)
create policy "Allow authenticated read" on loans for select using (auth.role() = 'authenticated');
create policy "Allow authenticated write" on loans for all using (auth.role() = 'authenticated');

create policy "Allow authenticated read" on conditions for select using (auth.role() = 'authenticated');
create policy "Allow authenticated write" on conditions for all using (auth.role() = 'authenticated');

create policy "Allow authenticated read" on uploaded_documents for select using (auth.role() = 'authenticated');
create policy "Allow authenticated write" on uploaded_documents for all using (auth.role() = 'authenticated');

create policy "Allow authenticated read" on ai_rules for select using (auth.role() = 'authenticated');
create policy "Allow authenticated write" on ai_rules for all using (auth.role() = 'authenticated');

create policy "Allow authenticated read" on notification_settings for select using (auth.role() = 'authenticated');
create policy "Allow authenticated write" on notification_settings for all using (auth.role() = 'authenticated');

-- =====================
-- SEED DATA
-- =====================
insert into loans (id, borrower, loan_amount, property, stage, open_conditions, missing_docs, next_action, last_response, status, processor) values
  ('LN-2847', 'James & Sarah Mitchell', 485000, '123 Oak Street, Austin TX 78701', 'Underwriting', 6, 2, 'Bank statements overdue', '2h ago', 'waiting_borrower', 'Maria Garcia'),
  ('LN-2901', 'David Chen', 650000, '445 Willow Ave, Denver CO 80202', 'Underwriting', 3, 1, 'Review uploaded paystub', '45m ago', 'in_review', 'Maria Garcia'),
  ('LN-2756', 'Priya & Arjun Sharma', 320000, '88 Maple Drive, Portland OR 97201', 'Final Review', 1, 0, 'Approve final condition', '1d ago', 'action_needed', 'Maria Garcia'),
  ('LN-2934', 'Robert & Linda Thompson', 875000, '2290 Pine Court, Seattle WA 98101', 'Underwriting', 8, 4, 'Multiple docs missing', '3d ago', 'waiting_borrower', 'Maria Garcia'),
  ('LN-2815', 'Ana Rodriguez', 290000, '55 Sunset Blvd, Miami FL 33101', 'Conditions Clear', 0, 0, 'Ready for closing', '12h ago', 'cleared', 'Maria Garcia'),
  ('LN-2967', 'Marcus Williams', 415000, '789 Birch Lane, Chicago IL 60601', 'Underwriting', 5, 3, 'W2s & tax returns needed', '6h ago', 'waiting_borrower', 'Maria Garcia')
on conflict (id) do nothing;

insert into conditions (id, loan_id, text, document_type, status, requested_at, received_at, cleared_at) values
  ('C-001', 'LN-2847', 'Provide two most recent bank statements for account ending 4582.', 'Bank Statement', 'requested', '2 days ago', null, null),
  ('C-002', 'LN-2847', 'Provide most recent 30-day paystub from primary employer.', 'Paystub', 'received', '3 days ago', '1 day ago', null),
  ('C-003', 'LN-2847', 'Letter of explanation required for large deposit on 11/15 ($12,400).', 'Letter of Explanation', 'needs_review', '4 days ago', '6h ago', null),
  ('C-004', 'LN-2847', 'Provide signed 4506-C tax transcript authorization form.', '4506-C Form', 'cleared', '5 days ago', '4 days ago', '3 days ago'),
  ('C-005', 'LN-2847', 'Homeowners insurance binder showing coverage of at least $500,000.', 'Insurance Binder', 'pending', null, null, null),
  ('C-006', 'LN-2847', 'Gift letter from donor for down payment funds received.', 'Gift Letter', 'requested', '1 day ago', null, null),
  ('C-007', 'LN-2901', 'Provide most recent 30-day paystub.', 'Paystub', 'needs_review', '2 days ago', '45m ago', null),
  ('C-008', 'LN-2901', 'Provide 2022 and 2023 federal tax returns (all pages).', 'Tax Returns', 'requested', '2 days ago', null, null),
  ('C-009', 'LN-2901', 'Copy of executed purchase agreement.', 'Purchase Agreement', 'cleared', '4 days ago', '3 days ago', '2 days ago')
on conflict (id) do nothing;

insert into uploaded_documents (id, condition_id, loan_id, borrower, filename, uploaded_at, type, status, ai_confidence, ai_issues, date_range) values
  ('D-001', 'C-003', 'LN-2847', 'James & Sarah Mitchell', 'letter_explanation_Nov_deposit.pdf', '6h ago', 'Letter of Explanation', 'pending_review', 94, '{}', null),
  ('D-002', 'C-007', 'LN-2901', 'David Chen', 'paystub_dec2024.pdf', '45m ago', 'Paystub', 'pending_review', 98, '{}', 'Dec 1–15, 2024'),
  ('D-003', 'C-002', 'LN-2847', 'James & Sarah Mitchell', 'bank_stmt_nov_oct.pdf', '1 day ago', 'Bank Statement', 'pending_review', 71, '{"Only 1 statement found, 2 required"}', 'Oct–Nov 2024')
on conflict (id) do nothing;

insert into ai_rules (document_type, checks) values
  ('Bank Statement', '["Account holder name matches borrower", "Statement date within 60 days", "All pages present", "Account number consistent"]'),
  ('Paystub', '["Employer name matches application", "YTD earnings present", "Date within 30 days", "Pay period visible"]'),
  ('Tax Returns', '["All schedules included", "Signature page present", "Year matches requirement", "Name matches borrower"]'),
  ('Letter of Explanation', '["Borrower signature present", "Date included", "Specific event addressed", "Contact info present"]'),
  ('Insurance Binder', '["Property address matches", "Coverage amount meets minimum", "Effective date valid", "Lender listed as mortgagee"]'),
  ('Purchase Agreement', '["Fully executed by all parties", "Property address correct", "Purchase price matches", "Closing date present"]')
on conflict do nothing;
