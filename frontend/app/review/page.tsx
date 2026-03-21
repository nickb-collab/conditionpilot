'use client';

import { useState } from 'react';
import Link from 'next/link';
import { uploadedDocuments as mockDocs } from '@/lib/mock-data';
import { usePendingDocuments } from '@/hooks/useDocuments';
import Sidebar from '@/components/Sidebar';

const IS_SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0F172A', color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', maxWidth: 360 }}>
      <span style={{ color: '#10B981', fontSize: 16 }}>✓</span>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', marginLeft: 8, fontSize: 16 }}>×</button>
    </div>
  );
}

type DocStatus = 'pending_review' | 'approved' | 'rejected';

export default function ReviewQueue() {
  const { documents: liveDocs, loading, approve, reject: rejectDoc, requestMore } = usePendingDocuments();

  // Use live data or mock data based on config
  const allDocuments = IS_SUPABASE_CONFIGURED ? liveDocs : mockDocs;

  // Local status state for mock-data mode
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>(
    Object.fromEntries(mockDocs.map(d => [d.id, d.status]))
  );
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(mockDocs[0]?.id || '');
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const setStatus = (id: string, status: DocStatus) => setDocStatuses(prev => ({ ...prev, [id]: status }));

  const handleApprove = async (docId: string, conditionId: string) => {
    if (IS_SUPABASE_CONFIGURED) {
      await approve(docId, conditionId);
    } else {
      setStatus(docId, 'approved');
    }
    showToast('Document approved · Condition marked as Cleared');
  };

  const handleReject = async (docId: string, conditionId: string) => {
    if (IS_SUPABASE_CONFIGURED) {
      await rejectDoc(docId, conditionId);
    } else {
      setStatus(docId, 'rejected');
    }
    setRejectModal(null);
    showToast(`Document rejected · Reason sent to borrower`);
  };

  const handleRequestMore = async (docId: string, conditionId: string) => {
    if (IS_SUPABASE_CONFIGURED) {
      await requestMore(docId, conditionId);
    } else {
      setStatus(docId, 'rejected');
    }
    showToast('Request for additional documents sent to borrower');
  };

  const selected = allDocuments.find(d => d.id === selectedDoc) ?? allDocuments[0];
  const pendingCount = IS_SUPABASE_CONFIGURED
    ? allDocuments.length
    : Object.values(docStatuses).filter(s => s === 'pending_review').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar active="review" />

      <main style={{ marginLeft: 232, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '22px 32px 18px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Review Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
            {pendingCount} document{pendingCount !== 1 ? 's' : ''} awaiting review
          </p>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Document List */}
          <div style={{ width: 320, borderRight: '1px solid var(--border)', overflow: 'auto', flexShrink: 0, background: '#fff' }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                All Documents ({allDocuments.length})
              </div>
            </div>
            {allDocuments.map(doc => {
              const status = IS_SUPABASE_CONFIGURED ? doc.status : (docStatuses[doc.id] ?? doc.status);
              const isSelected = selectedDoc === doc.id;
              const statusColor = status === 'approved' ? '#059669' : status === 'rejected' ? '#DC2626' : '#D97706';
              const statusLabel = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
              const statusBg = status === 'approved' ? '#ECFDF5' : status === 'rejected' ? '#FEF2F2' : '#FFFBEB';

              return (
                <div key={doc.id} onClick={() => setSelectedDoc(doc.id)} style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isSelected ? '#FFFBEB' : 'transparent', borderLeft: `3px solid ${isSelected ? '#F59E0B' : 'transparent'}`, transition: 'all 0.1s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{doc.borrower}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, background: '#F1F5F9', color: 'var(--text-secondary)', padding: '1px 6px', borderRadius: 4 }}>{doc.type}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.uploadedAt}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: statusColor, fontWeight: 600, background: statusBg, padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>{statusLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Review Panel */}
          {selected && (
            <div style={{ flex: 1, padding: '24px 30px', overflow: 'auto', background: 'var(--bg-base)' }}>
              {/* Doc Header */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 16, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{selected.filename}</h2>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Borrower: <strong style={{ color: 'var(--text-primary)' }}>{selected.borrower}</strong></span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>{selected.loanId}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploaded {selected.uploadedAt}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {(IS_SUPABASE_CONFIGURED ? selected.status === 'pending_review' : docStatuses[selected.id] === 'pending_review') && (
                      <>
                        <button onClick={() => handleApprove(selected.id, selected.conditionId)} style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600 }}>
                          ✓ Approve
                        </button>
                        <button onClick={() => setRejectModal(selected.id)} style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600 }}>
                          ✕ Reject
                        </button>
                        <button onClick={() => handleRequestMore(selected.id, selected.conditionId)} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 500 }}>
                          + Request More
                        </button>
                      </>
                    )}
                    {(IS_SUPABASE_CONFIGURED ? selected.status === 'approved' : docStatuses[selected.id] === 'approved') && (
                      <span style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600 }}>✓ Approved</span>
                    )}
                    {(IS_SUPABASE_CONFIGURED ? selected.status === 'rejected' : docStatuses[selected.id] === 'rejected') && (
                      <span style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600 }}>✕ Rejected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Classification */}
              {selected.aiConfidence && (
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 24px', marginBottom: 16, boxShadow: 'var(--shadow)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 16 }}>🤖</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Agent Analysis</span>
                    <span style={{ fontSize: 11, background: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: 10, fontWeight: 600, marginLeft: 'auto' }}>
                      Confidence: {selected.aiConfidence}%
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Type</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{selected.type}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 6, flex: 1, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${selected.aiConfidence}%`, background: selected.aiConfidence > 90 ? '#10B981' : '#F59E0B', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: selected.aiConfidence > 90 ? '#059669' : '#D97706' }}>{selected.aiConfidence}%</span>
                      </div>
                    </div>
                    {selected.dateRange && (
                      <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{selected.dateRange}</div>
                      </div>
                    )}
                  </div>

                  {selected.aiIssues && selected.aiIssues.length > 0 ? (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#B91C1C', marginBottom: 4 }}>⚠ Issues Detected by AI</div>
                      {selected.aiIssues.map((issue, i) => <div key={i} style={{ fontSize: 13, color: '#B91C1C' }}>• {issue}</div>)}
                    </div>
                  ) : (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, color: '#065F46' }}>✓ AI found no issues — document appears complete and valid</div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Preview */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Document Preview</span>
                  <button onClick={() => { setShowDocPreview(true); showToast(`Opening ${selected.filename} in full view`); }} style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 500, padding: '5px 12px', border: '1px solid #BFDBFE', borderRadius: 6, background: '#EFF6FF' }}>
                    Open Full Document
                  </button>
                </div>
                <div style={{ height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                  <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.25 }}>📄</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{selected.filename}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF · Uploaded {selected.uploadedAt}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Reject Document</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>The borrower will be notified with your reason and asked to re-upload.</p>
            <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, marginBottom: 18, outline: 'none', background: '#F8FAFC' }}>
              <option value="">Select a reason...</option>
              <option value="missing_pages">Document is missing pages</option>
              <option value="wrong_doc">Wrong document type uploaded</option>
              <option value="unreadable">Document is unreadable or blurry</option>
              <option value="date_range">Incorrect date range</option>
              <option value="wrong_account">Wrong account number</option>
              <option value="other">Other</option>
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>Cancel</button>
              <button onClick={async () => { if (rejectReason && rejectModal) { const doc = allDocuments.find(d => d.id === rejectModal); if (doc) await handleReject(rejectModal, doc.conditionId); setRejectReason(''); } }} style={{ flex: 1, padding: '10px', background: rejectReason ? '#FEF2F2' : '#F8FAFC', color: rejectReason ? '#B91C1C' : '#94A3B8', border: `1px solid ${rejectReason ? '#FECACA' : '#E2E8F0'}`, borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
