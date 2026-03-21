import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching our schema
export interface DbLoan {
  id: string;
  borrower: string;
  loan_amount: number;
  property: string;
  stage: string;
  open_conditions: number;
  missing_docs: number;
  next_action: string | null;
  last_response: string | null;
  status: 'waiting_borrower' | 'in_review' | 'cleared' | 'action_needed';
  processor: string;
  created_at: string;
  updated_at: string;
}

export interface DbCondition {
  id: string;
  loan_id: string;
  text: string;
  document_type: string;
  status: 'pending' | 'requested' | 'received' | 'needs_review' | 'cleared' | 'rejected';
  requested_at: string | null;
  received_at: string | null;
  cleared_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDocument {
  id: string;
  condition_id: string;
  loan_id: string;
  borrower: string;
  filename: string;
  uploaded_at: string;
  type: string;
  status: 'pending_review' | 'approved' | 'rejected';
  ai_confidence: number | null;
  ai_issues: string[];
  date_range: string | null;
  storage_path: string | null;
  created_at: string;
}

export interface DbAiRule {
  id: string;
  document_type: string;
  checks: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
