'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { loans as mockLoans, conditions as mockConditions } from '@/lib/mock-data';
import { useLoans } from '@/hooks/useLoans';

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

export default function BorrowersList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { loans: liveLoans } = useLoans();
  const loans = IS_SUPABASE_CONFIGURED ? liveLoans : mockLoans;
  const conditions = mockConditions; // conditions come from mock until per-loan fetching is added

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // Calculate totals
  const totalBorrowers = loans.length;
  const totalCleared = loans.reduce((sum, loan) => {
    const loanConditions = conditions[loan.id] || [];
    return sum + loanConditions.filter(c => c.status === 'cleared').length;
  }, 0);
  const totalMissingDocs = loans.reduce((sum, loan) => sum + loan.missingDocs, 0);

  // Filter loans by search
  const filteredLoans = loans.filter(loan =>
    loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      waiting_borrower: { label: 'Waiting Borrower', color: '#0891B2', bg: '#ECFDF5', border: '#A7F3D0' },
      in_review: { label: 'In Review', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
      action_needed: { label: 'Action Needed', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
      cleared: { label: 'Cleared', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
    };
    return colors[status as keyof typeof colors] || { label: status, color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      <Sidebar active="borrowers" />

      <main style={{ marginLeft: 232, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Borrowers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Manage and track all borrower loans and conditions</p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Borrowers', value: totalBorrowers.toString(), color: '#1D4ED8' },
            { label: 'Conditions Cleared', value: totalCleared.toString(), color: '#059669' },
            { label: 'Missing Docs', value: totalMissingDocs.toString(), color: '#B91C1C' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search borrowers or loan IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--text-primary)',
              background: '#fff',
              outline: 'none',
              boxShadow: 'var(--shadow)',
            }}
          />
        </div>

        {/* Borrowers Table */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          {/* Table Header */}
          <div style={{ padding: '13px 22px', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'grid', gridTemplateColumns: '1.4fr 0.9fr 1fr 1.2fr 0.9fr 0.75fr 0.85fr 1fr 0.8fr', gap: 12, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <div>Borrower Name</div>
            <div>Loan ID</div>
            <div>Loan Amount</div>
            <div>Property</div>
            <div>Total Conditions</div>
            <div>Cleared</div>
            <div>Missing Docs</div>
            <div>Last Activity</div>
            <div>Status</div>
          </div>

          {/* Table Rows */}
          {filteredLoans.length > 0 ? (
            filteredLoans.map(loan => {
              const loanConditions = conditions[loan.id] || [];
              const clearedCount = loanConditions.filter(c => c.status === 'cleared').length;
              const statusConfig = getStatusColor(loan.status);

              return (
                <Link
                  key={loan.id}
                  href={`/loans/${loan.id}`}
                  style={{
                    padding: '16px 22px',
                    borderBottom: '1px solid var(--border)',
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 0.9fr 1fr 1.2fr 0.9fr 0.75fr 0.85fr 1fr 0.8fr',
                    gap: 12,
                    alignItems: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Borrower Name */}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{loan.borrower}</div>
                  </div>

                  {/* Loan ID */}
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>{loan.id}</div>

                  {/* Loan Amount */}
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>${(loan.loanAmount / 1000).toFixed(0)}k</div>

                  {/* Property */}
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{loan.property}</div>

                  {/* Total Conditions */}
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{loanConditions.length}</div>

                  {/* Cleared */}
                  <div style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>{clearedCount}</div>

                  {/* Missing Docs */}
                  <div style={{ fontSize: 13, color: loan.missingDocs > 0 ? '#B91C1C' : '#059669', fontWeight: 600 }}>{loan.missingDocs}</div>

                  {/* Last Activity */}
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{loan.lastResponse}</div>

                  {/* Status */}
                  <div>
                    <span style={{ color: statusConfig.color, background: statusConfig.bg, border: `1px solid ${statusConfig.border}`, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {statusConfig.label}
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 14 }}>No borrowers found matching "{searchQuery}"</div>
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
