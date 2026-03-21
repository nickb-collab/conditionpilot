'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchPendingDocuments, updateDocumentStatus, uploadDocument, subscribeToDocuments } from '@/lib/db';
import type { UploadedDocument } from '@/lib/mock-data';
import type { Condition } from '@/lib/mock-data';

export function usePendingDocuments() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPendingDocuments();
      setDocuments(data);
      setError(null);
    } catch (e) {
      setError('Failed to load documents');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const channel = subscribeToDocuments(setDocuments);
    return () => { channel.unsubscribe(); };
  }, [load]);

  const approve = useCallback(async (docId: string, conditionId: string) => {
    await updateDocumentStatus(docId, 'approved', conditionId, 'cleared');
    setDocuments(prev => prev.filter(d => d.id !== docId));
  }, []);

  const reject = useCallback(async (docId: string, conditionId: string) => {
    await updateDocumentStatus(docId, 'rejected', conditionId, 'rejected');
    setDocuments(prev => prev.filter(d => d.id !== docId));
  }, []);

  const requestMore = useCallback(async (docId: string, conditionId: string) => {
    await updateDocumentStatus(docId, 'rejected', conditionId, 'requested');
    setDocuments(prev => prev.filter(d => d.id !== docId));
  }, []);

  const upload = useCallback(async (doc: {
    conditionId: string;
    loanId: string;
    borrower: string;
    filename: string;
    type: string;
    file?: File;
  }) => {
    const newDoc = await uploadDocument(doc);
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  }, []);

  return { documents, loading, error, approve, reject, requestMore, upload, reload: load };
}
