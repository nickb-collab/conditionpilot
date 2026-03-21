'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loans as mockLoans } from '@/lib/mock-data';
import { useLoans } from '@/hooks/useLoans';
import Sidebar from '@/components/Sidebar';

const IS_SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AI_ACTIVITY = [
  { time: '2m ago', action: 'Classified paystub from David Chen', result: '98% confidence · Paystub Dec 1–15', icon: '🤖', color: '#10B981' },
  { time: '6h ago', action: 'Detected issue: LN-2847 bank statement', result: 'Only 1 of 2 required statements found', icon: '⚠', color: '#F59E0B' },
  { time: '8h ago', action: 'Sent 24h reminder to James & Sarah Mitchell', result: 'Bank statements · LN-2847', icon: '📧', color: '#3B82F6' },
  { time: '1d ago', action: 'Cleared 4506-C for James & Sarah Mitchell', result: 'Document verified · LN-2847', icon: '✓', color: '#10B981' },
  { time: '1d ago', action: 'Auto-requested insurance binder', result: 'LN-2847 · Email sent to borrower', icon: '📧', color: '#3B82F6' },
];

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; bg: string; border: string }> = {
    waiting_borrower: { label: 'Waiting Borrower', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
    in_review: { label: 'In Review', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    action_needed: { label: 'Action Needed', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
    cleared: { label: 'Cleared ✓', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  };
  const c = configs[status] || { label: status, color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' };
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
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', marginLeft: 8, fontSize: 18, lineHeight: 1, cursor: 'pointer' }}>×</button>
    </div>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [showNewLoan, setShowNewLoan] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newLoan, setNewLoan] = useState({ borrower: '', loanAmount: '', property: '' });
  const [saving, setSaving] = useState(false);

  // Use live Supabase data if configured, otherwise fall back to mock data
  const { loans: liveLoans, loading, addLoan } = useLoans();
  const loans = IS_SUPABASE_CONFIGURED ? liveLoans : mockLoans;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };
  const filtered = loans.filter(l =>
    l.borrower.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateLoan = async () => {
    if (!newLoan.borrower) return;
    setSaving(true);
    try {
      if (IS_SUPABASE_CONFIGURED) {
        await addLoan({
          borrower: newLoan.borrower,
          loanAmount: Number(newLoan.loanAmount) || 0,
          property: newLoan.property,
          stage: 'Underwriting',
          openConditions: 0,
          missingDocs: 0,
          nextAction: 'Awaiting conditions setup',
          lastResponse: 'Just now',
          status: 'waiting_borrower',
          processor: 'Maria Garcia',
        });
      }
      setShowNewLoan(false);
      showToast(`Loan created for ${newLoan.borrower} · AI Agent will begin monitoring`);
      setNewLoan({ borrower: '', loanAmount: '', property: '' });
    } catch {
      showToast('Error creating loan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Active Loans', value: loans.length, color: '#3B82F6', bg: '#EFF6FF', icon: '◉' },
    { label: 'Open Conditions', value: loans.reduce((s, l) => s + l.openConditions, 0), color: '#D97706', bg: '#FFFBEB', icon: '◈' },
    { label: 'Missing Docs', value: loans.reduce((s, l) => s + l.missingDocs, 0), color: '#DC2626', bg: '#FEF2F2', icon: '!' },
    { label: 'Cleared Today', value: loans.filter(l => l.status === 'cleared').length, color: '#059669', bg: '#ECFDF5', icon: '✓' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar active="dashboard" />

      <main style={{ marginLeft: 232, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>Loan Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            {loading && IS_SUPABASE_CONFIGURED ? 'Loading…' : `${loans.length} active loans`}
            {!IS_SUPABASE_CONFIGURED && <span style={{ marginLeft: 8, fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: 10 }}>mock data</span>}
          </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="text" placeholder="Search loans..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--text-primary)', fontSize: 13, width: 220, outline: 'none', boxShadow: 'var(--shadow)' }} />
            <button onClick={() => setShowNewLoan(true)} style={{ background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>+ New Loan</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', boxShadow: 'var(--shadow)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: s.color, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Active Loans</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} loans</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
                    {['Borrower', 'Loan ID', 'Conditions', 'Missing Docs', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '9px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loan, i) => (
                    <tr key={loan.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{loan.borrower}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{loan.property.split(',')[0]}</div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-secondary)', background: '#F1F5F9', padding: '2px 7px', borderRadius: 4 }}>{loan.id}</span>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', fontWeight: 700, fontSize: 12, background: loan.openConditions > 5 ? '#FEF2F2' : loan.openConditions > 2 ? '#FFFBEB' : '#ECFDF5', color: loan.openConditions > 5 ? '#DC2626' : loan.openConditions > 2 ? '#D97706' : '#059669' }}>
                          {loan.openConditions}
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: loan.missingDocs > 0 ? '#DC2626' : '#059669' }}>{loan.missingDocs > 0 ? `${loan.missingDocs} missing` : '✓ Complete'}</span>
                      </td>
                      <td style={{ padding: '13px 18px' }}><StatusBadge status={loan.status} /></td>
                      <td style={{ padding: '13px 18px' }}>
                        <Link href={`/loans/${loan.id}`} style={{ fontSize: 12, color: '#D97706', fontWeight: 600, padding: '5px 12px', border: '1px solid #FDE68A', borderRadius: 6, background: '#FFFBEB', whiteSpace: 'nowrap' }}>View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Agent Panel */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Agent Activity</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Live</span>
            </div>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: '#FFFBEB' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5 }}>Currently Processing</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ fontSize: 13, color: '#78350F', fontWeight: 500 }}>Classifying paystub · LN-2901</span>
              </div>
            </div>
            <div style={{ padding: '10px 0' }}>
              {AI_ACTIVITY.map((item, i) => (
                <div key={i} style={{ padding: '7px 18px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.action}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{item.result}</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.time}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => showToast('Full activity log opened')} style={{ width: '100%', background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                View full activity log
              </button>
            </div>
          </div>
        </div>
      </main>

      {showNewLoan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Create New Loan</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Add a loan file to begin managing conditions.</p>
            {[
              { label: 'Borrower Name', key: 'borrower', placeholder: 'e.g. John & Jane Smith' },
              { label: 'Loan Amount', key: 'loanAmount', placeholder: 'e.g. 450000' },
              { label: 'Property Address', key: 'property', placeholder: 'e.g. 123 Main St, Austin TX' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{field.label}</label>
                <input placeholder={field.placeholder} value={newLoan[field.key as keyof typeof newLoan]} onChange={e => setNewLoan(prev => ({ ...prev, [field.key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: '#F8FAFC' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button onClick={() => setShowNewLoan(false)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateLoan} disabled={saving} style={{ flex: 1, padding: '10px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating…' : 'Create Loan'}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
