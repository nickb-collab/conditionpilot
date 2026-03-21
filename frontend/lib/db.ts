import { supabase, DbLoan, DbCondition, DbDocument, DbAiRule } from './supabase';
import type { Loan, Condition, UploadedDocument } from './mock-data';

// ─── Helper: convert snake_case DB rows to camelCase app types ───────────────

function dbLoanToLoan(l: DbLoan): Loan {
  return {
    id: l.id,
    borrower: l.borrower,
    loanAmount: l.loan_amount,
    property: l.property,
    stage: l.stage,
    openConditions: l.open_conditions,
    missingDocs: l.missing_docs,
    nextAction: l.next_action ?? '',
    lastResponse: l.last_response ?? '',
    status: l.status,
    processor: l.processor,
  };
}

function dbConditionToCondition(c: DbCondition): Condition {
  return {
    id: c.id,
    loanId: c.loan_id,
    text: c.text,
    documentType: c.document_type,
    status: c.status,
    requestedAt: c.requested_at ?? undefined,
    receivedAt: c.received_at ?? undefined,
    clearedAt: c.cleared_at ?? undefined,
    notes: c.notes ?? undefined,
  };
}

function dbDocToDoc(d: DbDocument): UploadedDocument {
  return {
    id: d.id,
    conditionId: d.condition_id,
    loanId: d.loan_id,
    borrower: d.borrower,
    filename: d.filename,
    uploadedAt: d.uploaded_at,
    type: d.type,
    status: d.status,
    aiConfidence: d.ai_confidence ?? undefined,
    aiIssues: d.ai_issues,
    dateRange: d.date_range ?? undefined,
  };
}

// ─── LOANS ───────────────────────────────────────────────────────────────────

export async function fetchLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbLoan[]).map(dbLoanToLoan);
}

export async function fetchLoan(id: string): Promise<Loan | null> {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return dbLoanToLoan(data as DbLoan);
}

export async function createLoan(loan: Omit<Loan, 'id'>): Promise<Loan> {
  const { data, error } = await supabase
    .from('loans')
    .insert({
      id: `LN-${Date.now().toString().slice(-4)}`,
      borrower: loan.borrower,
      loan_amount: loan.loanAmount,
      property: loan.property,
      stage: loan.stage,
      open_conditions: loan.openConditions,
      missing_docs: loan.missingDocs,
      next_action: loan.nextAction,
      last_response: loan.lastResponse,
      status: loan.status,
      processor: loan.processor,
    })
    .select()
    .single();

  if (error) throw error;
  return dbLoanToLoan(data as DbLoan);
}

// ─── CONDITIONS ──────────────────────────────────────────────────────────────

export async function fetchConditions(loanId: string): Promise<Condition[]> {
  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .eq('loan_id', loanId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as DbCondition[]).map(dbConditionToCondition);
}

export async function updateConditionStatus(
  conditionId: string,
  status: Condition['status'],
  extra?: { requested_at?: string; received_at?: string; cleared_at?: string; notes?: string }
): Promise<void> {
  const { error } = await supabase
    .from('conditions')
    .update({ status, ...extra })
    .eq('id', conditionId);

  if (error) throw error;
}

export async function requestConditionDocs(conditionId: string): Promise<void> {
  await updateConditionStatus(conditionId, 'requested', {
    requested_at: 'Just now',
  });
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

export async function fetchPendingDocuments(): Promise<UploadedDocument[]> {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbDocument[]).map(dbDocToDoc);
}

export async function updateDocumentStatus(
  docId: string,
  status: 'approved' | 'rejected',
  conditionId?: string,
  conditionStatus?: Condition['status']
): Promise<void> {
  const { error } = await supabase
    .from('uploaded_documents')
    .update({ status })
    .eq('id', docId);

  if (error) throw error;

  // Optionally update condition status as well
  if (conditionId && conditionStatus) {
    const extra: Record<string, string> = {};
    if (conditionStatus === 'cleared') extra.cleared_at = 'Just now';
    await updateConditionStatus(conditionId, conditionStatus, extra);
  }
}

export async function uploadDocument(doc: {
  conditionId: string;
  loanId: string;
  borrower: string;
  filename: string;
  type: string;
  file?: File;
}): Promise<UploadedDocument> {
  let storagePath: string | null = null;

  // Upload file to Supabase Storage if provided
  if (doc.file) {
    const path = `${doc.loanId}/${doc.conditionId}/${Date.now()}_${doc.filename}`;
    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(path, doc.file);

    if (!storageError) storagePath = path;
  }

  const { data, error } = await supabase
    .from('uploaded_documents')
    .insert({
      id: `D-${Date.now()}`,
      condition_id: doc.conditionId,
      loan_id: doc.loanId,
      borrower: doc.borrower,
      filename: doc.filename,
      uploaded_at: 'Just now',
      type: doc.type,
      status: 'pending_review',
      ai_confidence: null,
      ai_issues: [],
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) throw error;

  // Update condition to received
  await updateConditionStatus(doc.conditionId, 'received', {
    received_at: 'Just now',
  });

  return dbDocToDoc(data as DbDocument);
}

// ─── AI RULES ────────────────────────────────────────────────────────────────

export async function fetchAiRules(): Promise<DbAiRule[]> {
  const { data, error } = await supabase
    .from('ai_rules')
    .select('*')
    .order('document_type');

  if (error) throw error;
  return data as DbAiRule[];
}

export async function updateAiRule(
  id: string,
  updates: Partial<Pick<DbAiRule, 'checks' | 'enabled'>>
): Promise<void> {
  const { error } = await supabase
    .from('ai_rules')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// ─── REALTIME SUBSCRIPTIONS ──────────────────────────────────────────────────

export function subscribeToLoans(onUpdate: (loans: Loan[]) => void) {
  return supabase
    .channel('loans-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, async () => {
      const loans = await fetchLoans();
      onUpdate(loans);
    })
    .subscribe();
}

export function subscribeToConditions(loanId: string, onUpdate: (conditions: Condition[]) => void) {
  return supabase
    .channel(`conditions-${loanId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conditions', filter: `loan_id=eq.${loanId}` },
      async () => {
        const conditions = await fetchConditions(loanId);
        onUpdate(conditions);
      }
    )
    .subscribe();
}

export function subscribeToDocuments(onUpdate: (docs: UploadedDocument[]) => void) {
  return supabase
    .channel('documents-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'uploaded_documents' }, async () => {
      const docs = await fetchPendingDocuments();
      onUpdate(docs);
    })
    .subscribe();
}
