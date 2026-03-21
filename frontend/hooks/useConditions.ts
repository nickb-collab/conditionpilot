'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchConditions, requestConditionDocs, updateConditionStatus, subscribeToConditions } from '@/lib/db';
import type { Condition } from '@/lib/mock-data';

export function useConditions(loanId: string) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchConditions(loanId);
      setConditions(data);
      setError(null);
    } catch (e) {
      setError('Failed to load conditions');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    if (!loanId) return;
    load();
    const channel = subscribeToConditions(loanId, setConditions);
    return () => { channel.unsubscribe(); };
  }, [loanId, load]);

  const requestDocs = useCallback(async (conditionId: string) => {
    await requestConditionDocs(conditionId);
    setConditions(prev =>
      prev.map(c => c.id === conditionId ? { ...c, status: 'requested' as const, requestedAt: 'Just now' } : c)
    );
  }, []);

  const updateStatus = useCallback(async (
    conditionId: string,
    status: Condition['status'],
    extra?: { requestedAt?: string; receivedAt?: string; clearedAt?: string }
  ) => {
    await updateConditionStatus(conditionId, status, {
      requested_at: extra?.requestedAt,
      received_at: extra?.receivedAt,
      cleared_at: extra?.clearedAt,
    });
    setConditions(prev =>
      prev.map(c => c.id === conditionId ? { ...c, status, ...extra } : c)
    );
  }, []);

  return { conditions, loading, error, requestDocs, updateStatus, reload: load };
}
