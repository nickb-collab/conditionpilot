'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { loans as mockLoans, conditions as mockConditions } from '@/lib/mock-data';
import { useLoans } from '@/hooks/useLoans';
import { useConditions } from '@/hooks/useConditions';
import Sidebar from '@/components/Sidebar';

const IS_SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  requested: { label: 'Requested', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  received: { label: 'Received', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
  needs_review: { label: 'Needs Review', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  cleared: { label: 'Cleared ✓', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  rejected: { label: 'Rejected', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};

function ConditionBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || { label: status, color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' };
  return (
    <span style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  );
}


function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0F172A', color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', maxWidth: 360 }}>
      <span style={{ color: '#10B981', fontSize: 16 }}>✓</span>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', marginLeft: 8, fontSize: 16 }}>×</button>
    </div>
  );
}

export default function LoanDetail() {
  const params = useParams();
  const loanId = params.id as string;
  const [toast, setToast] = useState<string | null>(null);

  // Live data hooks
  const { loans: liveLoans } = useLoans();
  const { conditions: liveConditions, requestDocs } = useConditions(loanId);

  // Determine which data source to use
  const loan = IS_SUPABASE_CONFIGURED
    ? liveLoans.find(l => l.id === loanId)
    : mockLoans.find(l => l.id === loanId);

  const loanConditions = IS_SUPABASE_CONFIGURED
    ? liveConditions
    : (mockConditions[loanId] || []);

  // Local fallback for optimistic "requested" UI when not using Supabase
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const handleRequestDocs = async (condId: string, docType: string) => {
    if (IS_SUPABASE_CONFIGURED) {
      await requestDocs(condId);
    } else {
      setRequestedIds(prev => [...prev, condId]);
    }
    showToast(`Document request sent to borrower for: ${docType}`);
  };

  if (!loan) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar active="dashboard" />
        <main style={{ marginLeft: 232, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, color: 'var(--text-primary)' }}>Loan not found</div>
            <Link href="/" style={{ color: '#D97706', fontSize: 14, marginTop: 10, display: 'block' }}>← Back to dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  const cleared = loanConditions.filter(c => c.status === 'cleared').length;
  const total = loanConditions.length;
  const progress = total > 0 ? Math.round((cleared / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar active="dashboard" />

      <main style={{ marginLeft: 232, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Dashboard</Link>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
          <span style={{ color: 'var(--text-primary)', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>{loanId}</span>
        </div>

        {/* Loan Header */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 26px', marginBottom: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>{loan.borrower}</h1>
              <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Loan ID', value: loan.id, mono: true },
                  { label: 'Amount', value: `$${loan.loanAmount.toLocaleString()}`, mono: true },
                  { label: 'Stage', value: loan.stage },
                  { label: 'Property', value: loan.property },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f.mono ? 'DM Mono, monospace' : 'inherit' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Conditions Cleared</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {cleared}<span style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 400 }}>/{total}</span>
              </div>
              <div style={{ marginTop: 8, height: 6, background: '#F1F5F9', borderRadius: 3, width: 140, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#10B981' : '#F59E0B', borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{progress}% complete</div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ padding: '13px 22px', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Underwriting Conditions</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{total} conditions</span>
          </div>

          {loanConditions.map((cond, i) => {
            const isLast = i === loanConditions.length - 1;
            const alreadyRequested = !IS_SUPABASE_CONFIGURED && requestedIds.includes(cond.id);
            const effectiveStatus = alreadyRequested && cond.status === 'pending' ? 'requested' : cond.status;
            const cfg = STATUS_CONFIG[effectiveStatus];

            return (
              <div key={cond.id} style={{ padding: '16px 22px', borderBottom: isLast ? 'none' : '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: cfg?.color || '#94A3B8' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 6 }}>{cond.text}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, background: '#F1F5F9', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{cond.documentType}</span>
                        {cond.requestedAt && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Requested {cond.requestedAt}</span>}
                        {cond.receivedAt && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· Received {cond.receivedAt}</span>}
                        {cond.clearedAt && <span style={{ fontSize: 11, color: '#059669' }}>· Cleared {cond.clearedAt}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <ConditionBadge status={effectiveStatus} />
                      {effectiveStatus === 'pending' && (
                        <button onClick={() => handleRequestDocs(cond.id, cond.documentType)} style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 500, padding: '5px 12px', border: '1px solid #BFDBFE', borderRadius: 6, background: '#EFF6FF' }}>
                          Request Docs
                        </button>
                      )}
                      {effectiveStatus === 'needs_review' && (
                        <Link href="/review" style={{ fontSize: 12, color: '#B45309', fontWeight: 500, padding: '5px 12px', border: '1px solid #FDE68A', borderRadius: 6, background: '#FFFBEB' }}>
                          Review →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => showToast(`Reminders sent to ${loan.borrower} for all pending conditions`)} style={{ background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, boxShadow: '0 2px 8px rgba(245,158,11,0.25)' }}>
            Send All Reminders
          </button>
          <Link href="/portal" style={{ background: '#fff', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px', fontSize: 13, display: 'inline-block' }}>
            Preview Borrower Portal
          </Link>
          <button onClick={() => showToast('AI Agent: Re-analyzing all conditions for this loan')} style={{ background: '#fff', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>
            🤖 Run AI Analysis
          </button>
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
