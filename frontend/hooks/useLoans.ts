'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchLoans, fetchLoan, createLoan, subscribeToLoans } from '@/lib/db';
import type { Loan } from '@/lib/mock-data';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLoans();
      setLoans(data);
      setError(null);
    } catch (e) {
      setError('Failed to load loans');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Subscribe to real-time updates
    const channel = subscribeToLoans(setLoans);
    return () => { channel.unsubscribe(); };
  }, [load]);

  const addLoan = useCallback(async (loan: Omit<Loan, 'id'>) => {
    const newLoan = await createLoan(loan);
    setLoans(prev => [newLoan, ...prev]);
    return newLoan;
  }, []);

  return { loans, loading, error, reload: load, addLoan };
}

export function useLoan(id: string) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoan(id).then(data => {
      setLoan(data);
      setLoading(false);
    });
  }, [id]);

  return { loan, loading };
}
