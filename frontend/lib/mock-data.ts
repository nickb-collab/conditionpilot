export interface Loan {
  id: string;
  borrower: string;
  loanAmount: number;
  property: string;
  stage: string;
  openConditions: number;
  missingDocs: number;
  nextAction: string;
  lastResponse: string;
  status: 'waiting_borrower' | 'in_review' | 'cleared' | 'action_needed';
  processor: string;
}

export interface Condition {
  id: string;
  loanId: string;
  text: string;
  documentType: string;
  status: 'pending' | 'requested' | 'received' | 'needs_review' | 'cleared' | 'rejected';
  requestedAt?: string;
  receivedAt?: string;
  clearedAt?: string;
  notes?: string;
}

export interface UploadedDocument {
  id: string;
  conditionId: string;
  loanId: string;
  borrower: string;
  filename: string;
  uploadedAt: string;
  type: string;
  status: 'pending_review' | 'approved' | 'rejected';
  aiConfidence?: number;
  aiIssues?: string[];
  dateRange?: string;
}

export const loans: Loan[] = [
  {
    id: 'LN-2847',
    borrower: 'James & Sarah Mitchell',
    loanAmount: 485000,
    property: '123 Oak Street, Austin TX 78701',
    stage: 'Underwriting',
    openConditions: 6,
    missingDocs: 2,
    nextAction: 'Bank statements overdue',
    lastResponse: '2h ago',
    status: 'waiting_borrower',
    processor: 'Maria Garcia',
  },
  {
    id: 'LN-2901',
    borrower: 'David Chen',
    loanAmount: 650000,
    property: '445 Willow Ave, Denver CO 80202',
    stage: 'Underwriting',
    openConditions: 3,
    missingDocs: 1,
    nextAction: 'Review uploaded paystub',
    lastResponse: '45m ago',
    status: 'in_review',
    processor: 'Maria Garcia',
  },
  {
    id: 'LN-2756',
    borrower: 'Priya & Arjun Sharma',
    loanAmount: 320000,
    property: '88 Maple Drive, Portland OR 97201',
    stage: 'Final Review',
    openConditions: 1,
    missingDocs: 0,
    nextAction: 'Approve final condition',
    lastResponse: '1d ago',
    status: 'action_needed',
    processor: 'Maria Garcia',
  },
  {
    id: 'LN-2934',
    borrower: 'Robert & Linda Thompson',
    loanAmount: 875000,
    property: '2290 Pine Court, Seattle WA 98101',
    stage: 'Underwriting',
    openConditions: 8,
    missingDocs: 4,
    nextAction: 'Multiple docs missing',
    lastResponse: '3d ago',
    status: 'waiting_borrower',
    processor: 'Maria Garcia',
  },
  {
    id: 'LN-2815',
    borrower: 'Ana Rodriguez',
    loanAmount: 290000,
    property: '55 Sunset Blvd, Miami FL 33101',
    stage: 'Conditions Clear',
    openConditions: 0,
    missingDocs: 0,
    nextAction: 'Ready for closing',
    lastResponse: '12h ago',
    status: 'cleared',
    processor: 'Maria Garcia',
  },
  {
    id: 'LN-2967',
    borrower: 'Marcus Williams',
    loanAmount: 415000,
    property: '789 Birch Lane, Chicago IL 60601',
    stage: 'Underwriting',
    openConditions: 5,
    missingDocs: 3,
    nextAction: 'W2s & tax returns needed',
    lastResponse: '6h ago',
    status: 'waiting_borrower',
    processor: 'Maria Garcia',
  },
];

export const conditions: Record<string, Condition[]> = {
  'LN-2847': [
    {
      id: 'C-001',
      loanId: 'LN-2847',
      text: 'Provide two most recent bank statements for account ending 4582.',
      documentType: 'Bank Statement',
      status: 'requested',
      requestedAt: '2 days ago',
    },
    {
      id: 'C-002',
      loanId: 'LN-2847',
      text: 'Provide most recent 30-day paystub from primary employer.',
      documentType: 'Paystub',
      status: 'received',
      requestedAt: '3 days ago',
      receivedAt: '1 day ago',
    },
    {
      id: 'C-003',
      loanId: 'LN-2847',
      text: 'Letter of explanation required for large deposit on 11/15 ($12,400).',
      documentType: 'Letter of Explanation',
      status: 'needs_review',
      requestedAt: '4 days ago',
      receivedAt: '6h ago',
    },
    {
      id: 'C-004',
      loanId: 'LN-2847',
      text: 'Provide signed 4506-C tax transcript authorization form.',
      documentType: '4506-C Form',
      status: 'cleared',
      requestedAt: '5 days ago',
      receivedAt: '4 days ago',
      clearedAt: '3 days ago',
    },
    {
      id: 'C-005',
      loanId: 'LN-2847',
      text: 'Homeowners insurance binder showing coverage of at least $500,000.',
      documentType: 'Insurance Binder',
      status: 'pending',
    },
    {
      id: 'C-006',
      loanId: 'LN-2847',
      text: 'Gift letter from donor for down payment funds received.',
      documentType: 'Gift Letter',
      status: 'requested',
      requestedAt: '1 day ago',
    },
  ],
  'LN-2901': [
    {
      id: 'C-007',
      loanId: 'LN-2901',
      text: 'Provide most recent 30-day paystub.',
      documentType: 'Paystub',
      status: 'needs_review',
      requestedAt: '2 days ago',
      receivedAt: '45m ago',
    },
    {
      id: 'C-008',
      loanId: 'LN-2901',
      text: 'Provide 2022 and 2023 federal tax returns (all pages).',
      documentType: 'Tax Returns',
      status: 'requested',
      requestedAt: '2 days ago',
    },
    {
      id: 'C-009',
      loanId: 'LN-2901',
      text: 'Copy of executed purchase agreement.',
      documentType: 'Purchase Agreement',
      status: 'cleared',
      requestedAt: '4 days ago',
      receivedAt: '3 days ago',
      clearedAt: '2 days ago',
    },
  ],
};

export const uploadedDocuments: UploadedDocument[] = [
  {
    id: 'D-001',
    conditionId: 'C-003',
    loanId: 'LN-2847',
    borrower: 'James & Sarah Mitchell',
    filename: 'letter_explanation_Nov_deposit.pdf',
    uploadedAt: '6h ago',
    type: 'Letter of Explanation',
    status: 'pending_review',
    aiConfidence: 94,
    aiIssues: [],
  },
  {
    id: 'D-002',
    conditionId: 'C-007',
    loanId: 'LN-2901',
    borrower: 'David Chen',
    filename: 'paystub_dec2024.pdf',
    uploadedAt: '45m ago',
    type: 'Paystub',
    status: 'pending_review',
    aiConfidence: 98,
    dateRange: 'Dec 1–15, 2024',
    aiIssues: [],
  },
  {
    id: 'D-003',
    conditionId: 'C-002',
    loanId: 'LN-2847',
    borrower: 'James & Sarah Mitchell',
    filename: 'bank_stmt_nov_oct.pdf',
    uploadedAt: '1 day ago',
    type: 'Bank Statement',
    status: 'pending_review',
    aiConfidence: 71,
    dateRange: 'Oct–Nov 2024',
    aiIssues: ['Only 1 statement found, 2 required'],
  },
];
