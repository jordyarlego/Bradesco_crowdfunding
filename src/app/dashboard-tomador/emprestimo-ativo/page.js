'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarTomador from '../../components/SidebarTomador';
import { getCurrentUser, isBorrower } from '../../utils/auth';

export default function EmprestimoAtivo() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [toast, setToast] = useState(null);

  // Dados mockados do empréstimo
  const emprestimo = {
    montante: 50000,
    saldoDevedor: 35000,
    juros: 2.5,
    dataInicio: '01/01/2025',
    dataFim: '01/01/2028',
    status: 'Ativo',
    totalParcelas: 36
  };

  // Dados mockados das parcelas
  const [parcelas, setParcelas] = useState([
    { id: 1, numero: 1, valor: 1850.50, vencimento: '01/02/2025', status: 'paga' },
    { id: 2, numero: 2, valor: 1850.50, vencimento: '01/03/2025', status: 'paga' },
    { id: 3, numero: 3, valor: 1850.50, vencimento: '01/04/2025', status: 'paga' },
    { id: 4, numero: 4, valor: 1850.50, vencimento: '01/05/2025', status: 'paga' },
    { id: 5, numero: 5, valor: 1850.50, vencimento: '01/06/2025', status: 'paga' },
    { id: 6, numero: 6, valor: 1850.50, vencimento: '01/07/2025', status: 'em_aberto' },
    { id: 7, numero: 7, valor: 1850.50, vencimento: '01/08/2025', status: 'em_aberto' },
    { id: 8, numero: 8, valor: 1850.50, vencimento: '01/09/2025', status: 'em_aberto' },
    { id: 9, numero: 9, valor: 1850.50, vencimento: '01/10/2025', status: 'futura' },
    { id: 10, numero: 10, valor: 1850.50, vencimento: '01/11/2025', status: 'futura' },
    { id: 11, numero: 11, valor: 1850.50, vencimento: '01/12/2025', status: 'futura' },
    { id: 12, numero: 12, valor: 1850.50, vencimento: '01/01/2026', status: 'futura' },
  ]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isBorrower()) {
      router.push('/entrar');
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleGerarBoleto = (parcela) => {
    setToast({ 
      message: `Boleto da parcela ${parcela.numero} gerado com sucesso!`, 
      type: 'success' 
    });
    setTimeout(() => setToast(null), 4000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      paga: 'bg-green-100 text-green-700',
      em_aberto: 'bg-yellow-100 text-yellow-700',
      atrasada: 'bg-red-100 text-red-700',
      futura: 'bg-blue-100 text-blue-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      paga: 'Paga',
      em_aberto: 'Em Aberto',
      atrasada: 'Atrasada',
      futura: 'Futura'
    };
    return labels[status] || status;
  };

  const parcelasFiltradas = filtroStatus === 'todas' 
    ? parcelas 
    : parcelas.filter(p => p.status === filtroStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarTomador user={user} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard-tomador')}
              className="text-gray-600 hover:text-brand-pink transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-brand-purple-dark">
              Empréstimo Ativo
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Montante */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm opacity-80 mb-2">Montante do Empréstimo</h3>
              <p className="text-3xl font-bold">{formatarMoeda(emprestimo.montante)}</p>
            </div>

            {/* Saldo Devedor */}
            <div className="bg-gradient-to-br from-brand-pink to-brand-purple-dark rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm opacity-80 mb-2">Saldo Devedor</h3>
              <p className="text-3xl font-bold">{formatarMoeda(emprestimo.saldoDevedor)}</p>
            </div>

            {/* Taxa de Juros */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm opacity-80 mb-2">Taxa de Juros</h3>
              <p className="text-3xl font-bold">{emprestimo.juros}% a.m.</p>
            </div>
          </div>

          {/* Informações do Empréstimo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-6">
              Informações do Empréstimo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Data de Início</p>
                <p className="text-lg font-bold text-brand-purple-dark">{emprestimo.dataInicio}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Data de Fim</p>
                <p className="text-lg font-bold text-brand-purple-dark">{emprestimo.dataFim}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  {emprestimo.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Parcelas</p>
                <p className="text-lg font-bold text-brand-purple-dark">{emprestimo.totalParcelas}x</p>
              </div>
            </div>
          </div>

          {/* Filtros e Lista de Parcelas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-purple-dark">
                Parcelas
              </h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFiltroStatus('todas')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    filtroStatus === 'todas'
                      ? 'bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltroStatus('paga')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    filtroStatus === 'paga'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pagas
                </button>
                <button
                  onClick={() => setFiltroStatus('em_aberto')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    filtroStatus === 'em_aberto'
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Em Aberto
                </button>
                <button
                  onClick={() => setFiltroStatus('atrasada')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    filtroStatus === 'atrasada'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Atrasadas
                </button>
                <button
                  onClick={() => setFiltroStatus('futura')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    filtroStatus === 'futura'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Futuras
                </button>
              </div>
            </div>

            {/* Lista de Parcelas */}
            <div className="space-y-3">
              {parcelasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma parcela encontrada com este filtro
                </div>
              ) : (
                parcelasFiltradas.map((parcela) => (
                  <div
                    key={parcela.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-brand-pink to-brand-purple-dark rounded-full flex items-center justify-center text-white font-bold">
                        {parcela.numero}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-gray-800">
                            Parcela {parcela.numero}
                          </p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(parcela.status)}`}>
                            {getStatusLabel(parcela.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            <strong>Valor:</strong> {formatarMoeda(parcela.valor)}
                          </span>
                          <span>
                            <strong>Vencimento:</strong> {parcela.vencimento}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGerarBoleto(parcela)}
                      className="px-6 py-2 bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      Gerar Boleto
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed top-4 right-4 z-50 max-w-md"
          style={{ animation: 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <div className={`rounded-xl shadow-2xl p-4 flex items-center gap-4 ${
            toast.type === 'error' 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
              : 'bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'error' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className="flex-1 font-semibold">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

