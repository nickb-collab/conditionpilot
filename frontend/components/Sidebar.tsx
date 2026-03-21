'use client';

import Link from 'next/link';

interface SidebarProps {
  active: string;
}

export default function Sidebar({ active }: SidebarProps) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
    { id: 'borrowers', label: 'Borrowers', href: '/borrowers' },
    { id: 'review', label: 'Review Queue', href: '/review', badge: 3 },
    { id: 'portal', label: 'Borrower Portal', href: '/portal' },
  ];

  return (
    <div style={{
      width: 232, minHeight: '100vh', background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>CP</div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>ConditionPilot</span>
        </div>
      </div>

      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 10px 8px', textTransform: 'uppercase' }}>Workspace</div>
        {nav.map(item => {
          const isActive = active === item.id;
          return (
            <Link key={item.id} href={item.href} style={{
              display: 'flex', alignItems: 'center', padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              background: isActive ? '#FFFBEB' : 'transparent',
              color: isActive ? '#D97706' : 'var(--text-secondary)',
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              border: isActive ? '1px solid #FDE68A' : '1px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* AI Agent Status */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 10px 8px', textTransform: 'uppercase' }}>AI Agent</div>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 14px', margin: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>Active</span>
            </div>
            <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.5 }}>Monitoring 6 loans</div>
            <div style={{ fontSize: 12, color: '#047857' }}>3 docs in queue</div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#fff', background: '#059669', padding: '3px 8px', borderRadius: 5, display: 'inline-block' }}>
              Next: reminders in 2h
            </div>
          </div>
        </div>
      </nav>

      {/* Settings + User */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', padding: '10px 22px',
          color: active === 'settings' ? '#D97706' : 'var(--text-secondary)',
          fontSize: 14, borderBottom: '1px solid var(--border)',
          background: active === 'settings' ? '#FFFBEB' : 'transparent',
          fontWeight: active === 'settings' ? 600 : 400,
        }}>
          ⚙ Settings
        </Link>
        <div style={{ padding: '12px 18px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>MG</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Maria Garcia</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Processor</div>
          </div>
        </div>
      </div>
    </div>
  );
}
