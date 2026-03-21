'use client';

import { useState } from 'react';

const REQUIRED_DOCS = [
  { id: 'bank', label: 'Two most recent bank statements', detail: 'Account ending 4582 · PDF or JPG', required: true },
  { id: 'gift', label: 'Gift letter from donor', detail: 'For down payment funds · PDF', required: true },
  { id: 'insurance', label: 'Homeowners insurance binder', detail: 'Coverage of at least $500,000', required: true },
];

interface UploadedFile {
  name: string;
  size: string;
  docId: string;
  status: 'uploading' | 'done';
}

export default function BorrowerPortal() {
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string>('bank');
  const [submitted, setSubmitted] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const entry: UploadedFile = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        docId: selectedDoc,
        status: 'uploading',
      };
      setUploaded(prev => [...prev, entry]);
      setTimeout(() => {
        setUploaded(prev => prev.map(u => u.name === entry.name ? { ...u, status: 'done' } : u));
      }, 1500);
    });
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 64, height: 64, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>✓</div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#111827', marginBottom: 10, textAlign: 'center' }}>Documents Submitted!</h2>
        <p style={{ color: '#6B7280', fontSize: 15, textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
          Thank you, James. Your lender has been notified and will review your documents shortly. You'll receive a confirmation email at james@email.com.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFB', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '16px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>CP</div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14, color: '#111827' }}>ConditionPilot</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Powered by ConditionPilot · Secure Upload</div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Hi James, your lender needs a few documents
          </h1>
          <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Please upload the documents below to keep your loan moving forward. All uploads are encrypted and secure.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 16px', fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: '#92400E' }}>Due:</span> <span style={{ color: '#92400E' }}>Friday, March 20</span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#374151' }}>
              Loan: <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>LN-2847</span> · 123 Oak St, Austin TX
            </div>
          </div>
        </div>

        {/* Required Docs */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            Documents Needed ({REQUIRED_DOCS.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {REQUIRED_DOCS.map(doc => {
              const isDone = uploaded.some(u => u.docId === doc.id && u.status === 'done');
              const isSelected = selectedDoc === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                    background: isSelected ? '#FFFBEB' : '#F9FAFB',
                    border: `1px solid ${isSelected ? '#FDE68A' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? '#D1FAE5' : isSelected ? '#FEF3C7' : '#E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: isDone ? '#059669' : isSelected ? '#D97706' : '#9CA3AF',
                  }}>
                    {isDone ? '✓' : '!'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{doc.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{doc.detail}</div>
                  </div>
                  {isSelected && <span style={{ fontSize: 12, color: '#D97706', fontWeight: 500 }}>Upload here</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Zone */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            Upload for: {REQUIRED_DOCS.find(d => d.id === selectedDoc)?.label}
          </div>

          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'block', border: `2px dashed ${dragging ? '#F59E0B' : '#D1D5DB'}`,
              borderRadius: 10, padding: '32px 24px', textAlign: 'center',
              background: dragging ? '#FFFBEB' : '#F9FAFB', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileInput} />
            <div style={{ fontSize: 28, marginBottom: 12 }}>↑</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
              {dragging ? 'Drop files here' : 'Drag & drop or click to upload'}
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>PDF, JPG, PNG accepted · Max 25MB per file</div>
          </label>

          {/* Uploaded files */}
          {uploaded.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {uploaded.map((file, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#F9FAFB', border: '1px solid #E5E7EB',
                  borderRadius: 8, padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 18 }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {file.size} · {REQUIRED_DOCS.find(d => d.id === file.docId)?.label}
                    </div>
                  </div>
                  {file.status === 'uploading' ? (
                    <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 500 }}>Uploading...</span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✓ Uploaded</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={() => uploaded.length > 0 && setSubmitted(true)}
          style={{
            width: '100%', padding: '14px', fontSize: 15, fontWeight: 600,
            background: uploaded.length > 0 ? '#F59E0B' : '#E5E7EB',
            color: uploaded.length > 0 ? '#000' : '#9CA3AF',
            border: 'none', borderRadius: 10, transition: 'all 0.15s',
          }}
        >
          {uploaded.length > 0 ? `Submit ${uploaded.filter(u => u.status === 'done').length} Document${uploaded.length !== 1 ? 's' : ''}` : 'Upload documents to submit'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
          🔒 Your documents are encrypted and only accessible to your lender. Questions? Call (512) 555-0100.
        </p>
      </div>
    </div>
  );
}
