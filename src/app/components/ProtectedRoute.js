'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, onlyInvestor, onlyBorrower }) {
  const { autenticado, loading, isInvestor, isBorrower } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!autenticado) {
      router.push('/entrar');
      return;
    }

    if (onlyInvestor && !isInvestor()) {
      router.push('/dashboard-tomador');
      return;
    }

    if (onlyBorrower && !isBorrower()) {
      router.push('/dashboard-investidor');
      return;
    }

  }, [autenticado, loading]);

  if (loading) return <div>Carregando...</div>;

  return children;
}
