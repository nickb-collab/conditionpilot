'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { fetchAiRules, updateAiRule } from '@/lib/db';

const IS_SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface AIRule {
  docType: string;
  checks: { label: string; enabled: boolean }[];
}

interface ReminderConfig {
  name: string;
  hours: number;
  enabled: boolean;
  message: string;
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

// Map Supabase rules to UI format
type DbRuleRow = { id: string; document_type: string; checks: string[]; enabled: boolean };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('ai-rules');
  const [toast, setToast] = useState<string | null>(null);
  const [editingRuleIdx, setEditingRuleIdx] = useState<number | null>(null);
  const [dbRules, setDbRules] = useState<DbRuleRow[]>([]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // Load AI rules from Supabase if configured
  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED) return;
    fetchAiRules().then(rules => setDbRules(rules as DbRuleRow[])).catch(console.error);
  }, []);

  // AI Rules State
  const [aiRules, setAiRules] = useState<AIRule[]>([
    {
      docType: 'Bank Statement',
      checks: [
        { label: 'Date range (last 60 days)', enabled: true },
        { label: 'All pages present', enabled: true },
        { label: 'Account number matches', enabled: true },
        { label: 'No large unexplained deposits >$5k', enabled: true },
      ],
    },
    {
      docType: 'Paystub',
      checks: [
        { label: 'Within 30 days', enabled: true },
        { label: 'Employer name', enabled: true },
        { label: 'YTD income', enabled: true },
        { label: 'Pay period dates', enabled: true },
      ],
    },
    {
      docType: 'Tax Returns',
      checks: [
        { label: 'All pages', enabled: true },
        { label: 'Correct year (2022+2023)', enabled: true },
        { label: 'Borrower name matches', enabled: true },
        { label: 'W2s included', enabled: true },
      ],
    },
    {
      docType: 'Letter of Explanation',
      checks: [
        { label: 'Signed by borrower', enabled: true },
        { label: 'Addresses specific condition', enabled: true },
        { label: 'Dated within 30 days', enabled: true },
      ],
    },
    {
      docType: '4506-C Form',
      checks: [
        { label: 'Signed', enabled: true },
        { label: 'Dated', enabled: true },
        { label: 'SSN matches', enabled: true },
        { label: 'Correct lender info', enabled: true },
      ],
    },
    {
      docType: 'Insurance Binder',
      checks: [
        { label: 'Coverage amount ≥$500k', enabled: true },
        { label: 'Property address matches', enabled: true },
        { label: 'Lender listed as mortgagee', enabled: true },
      ],
    },
  ]);

  // Notifications State
  const [reminders, setReminders] = useState<ReminderConfig[]>([
    { name: '24h Reminder', hours: 24, enabled: true, message: 'Please submit the following documents within 24 hours to keep your loan on track.' },
    { name: '72h Reminder', hours: 72, enabled: true, message: 'A gentle reminder: 3 days have passed. Please submit the requested documents.' },
    { name: '5 Day Reminder', hours: 120, enabled: true, message: 'Your document submission is now 5 days overdue. Urgent action needed.' },
    { name: 'Final Reminder', hours: 168, enabled: true, message: 'FINAL NOTICE: Documents are severely overdue. Failure to submit may delay closing.' },
  ]);

  const [channels, setChannels] = useState({
    email: true,
    sms: true,
    inApp: false,
  });

  // Account State
  const [accountInfo, setAccountInfo] = useState({
    name: 'Maria Garcia',
    email: 'maria.garcia@conditionpilot.com',
    role: 'Processor',
    company: 'Mortgage Corp USA',
  });
  const [editingAccount, setEditingAccount] = useState(false);

  // Integrations State
  const [integrations, setIntegrations] = useState([
    { name: 'LOS (Encompass)', status: 'disconnected' },
    { name: 'SendGrid', status: 'connected' },
    { name: 'Twilio SMS', status: 'connected' },
    { name: 'AWS S3', status: 'disconnected' },
  ]);

  // Toggle check in AI rule
  const toggleCheck = async (ruleIdx: number, checkIdx: number) => {
    const newRules = [...aiRules];
    newRules[ruleIdx].checks[checkIdx].enabled = !newRules[ruleIdx].checks[checkIdx].enabled;
    setAiRules(newRules);

    // Persist to Supabase if configured
    if (IS_SUPABASE_CONFIGURED && dbRules[ruleIdx]) {
      const updatedChecks = newRules[ruleIdx].checks.map(c => c.label);
      await updateAiRule(dbRules[ruleIdx].id, { checks: updatedChecks }).catch(console.error);
    }

    showToast('AI rule updated');
  };

  // Toggle reminder
  const toggleReminder = (idx: number) => {
    const newReminders = [...reminders];
    newReminders[idx].enabled = !newReminders[idx].enabled;
    setReminders(newReminders);
    showToast(`${reminders[idx].name} ${newReminders[idx].enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      <Sidebar active="settings" />

      <main style={{ marginLeft: 232, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Manage your account, integrations, and AI rules</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 1, marginBottom: 28, borderBottom: '1px solid var(--border)', background: '#fff', borderRadius: '12px 12px 0 0' }}>
          {['AI Rules', 'Notifications', 'Account', 'Integrations'].map(tab => {
            const tabId = tab.toLowerCase().replace(' ', '-');
            return (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  background: activeTab === tabId ? '#fff' : 'transparent',
                  borderBottom: activeTab === tabId ? '2px solid #D97706' : 'none',
                  color: activeTab === tabId ? '#D97706' : 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: activeTab === tabId ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ maxWidth: 900 }}>
          {/* AI Rules Tab */}
          {activeTab === 'ai-rules' && (
            <div>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 6 }}>AI Classification Rules</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Configure what the AI agent checks when classifying each document type. Toggle checks on/off to customize validation rules.</p>
                  </div>
                  <button onClick={() => showToast('Add new rule dialog would open')} style={{ background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Add Rule
                  </button>
                </div>

                {/* Rules List */}
                <div style={{ display: 'grid', gap: 16 }}>
                  {aiRules.map((rule, ruleIdx) => (
                    <div key={ruleIdx} style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{rule.docType}</h3>
                        <button onClick={() => { setEditingRuleIdx(editingRuleIdx === ruleIdx ? null : ruleIdx); showToast('Edit mode toggled'); }} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          ✎ Edit
                        </button>
                      </div>

                      {/* Checks as toggleable chips */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {rule.checks.map((check, checkIdx) => (
                          <button
                            key={checkIdx}
                            onClick={() => toggleCheck(ruleIdx, checkIdx)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 20,
                              border: `1px solid ${check.enabled ? '#10B981' : '#D1D5DB'}`,
                              background: check.enabled ? '#ECFDF5' : '#F3F4F6',
                              color: check.enabled ? '#059669' : '#6B7280',
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.1s',
                            }}
                          >
                            {check.enabled ? '✓ ' : ''}{check.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              {/* Reminder Schedule */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 20 }}>Reminder Schedule</h2>

                {reminders.map((reminder, idx) => (
                  <div key={idx} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: idx === reminders.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <input
                          type="checkbox"
                          checked={reminder.enabled}
                          onChange={() => toggleReminder(idx)}
                          style={{ width: 18, height: 18, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{reminder.name}</span>
                      </label>
                    </div>
                    <textarea
                      value={reminder.message}
                      onChange={(e) => {
                        const newReminders = [...reminders];
                        newReminders[idx].message = e.target.value;
                        setReminders(newReminders);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        marginTop: 10,
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        minHeight: 60,
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Channel Toggles */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', boxShadow: 'var(--shadow)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 20 }}>Notification Channels</h2>

                {[
                  { key: 'email', label: 'Email' },
                  { key: 'sms', label: 'SMS' },
                  { key: 'inApp', label: 'In-app' },
                ].map(channel => (
                  <label key={channel.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={channels[channel.key as keyof typeof channels]}
                      onChange={(e) => setChannels(prev => ({ ...prev, [channel.key]: e.target.checked }))}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', boxShadow: 'var(--shadow)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 20 }}>Profile</h2>

              {editingAccount ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  {[
                    { label: 'Name', key: 'name' },
                    { label: 'Email', key: 'email' },
                    { label: 'Role', key: 'role' },
                    { label: 'Company', key: 'company' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>{field.label}</label>
                      <input
                        type="text"
                        value={accountInfo[field.key as keyof typeof accountInfo]}
                        onChange={(e) => setAccountInfo(prev => ({ ...prev, [field.key]: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button onClick={() => { setEditingAccount(false); showToast('Changes saved'); }} style={{ flex: 1, background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Save Changes
                    </button>
                    <button onClick={() => setEditingAccount(false)} style={{ flex: 1, background: '#F8FAFC', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { label: 'Name', value: accountInfo.name },
                    { label: 'Email', value: accountInfo.email },
                    { label: 'Role', value: accountInfo.role },
                    { label: 'Company', value: accountInfo.company },
                  ].map(field => (
                    <div key={field.label} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{field.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{field.value}</div>
                    </div>
                  ))}
                  <button onClick={() => setEditingAccount(true)} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>
                    ✎ Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div style={{ display: 'grid', gap: 16 }}>
              {integrations.map(integration => (
                <div key={integration.name} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)' }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>{integration.name}</h3>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: integration.status === 'connected' ? '#059669' : '#B91C1C',
                      background: integration.status === 'connected' ? '#ECFDF5' : '#FEF2F2',
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}>
                      {integration.status === 'connected' ? '✓ Connected' : '✗ Not Connected'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newIntegrations = integrations.map(i => i.name === integration.name ? { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected' } : i);
                      setIntegrations(newIntegrations);
                      showToast(`${integration.name} ${integration.status === 'connected' ? 'disconnected' : 'connected'}`);
                    }}
                    style={{
                      background: integration.status === 'connected' ? '#FEF2F2' : '#EFF6FF',
                      color: integration.status === 'connected' ? '#B91C1C' : '#1D4ED8',
                      border: `1px solid ${integration.status === 'connected' ? '#FECACA' : '#BFDBFE'}`,
                      borderRadius: 8,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
