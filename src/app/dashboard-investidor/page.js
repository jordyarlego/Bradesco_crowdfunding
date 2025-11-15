'use client';

// src/app/dashboard-investidor/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isInvestor } from '../utils/auth';
import SidebarInvestidor from '../components/SidebarInvestidor';

export default function DashboardInvestidor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saldoDisponivel, setSaldoDisponivel] = useState(5000);
  const [isModalSaqueOpen, setIsModalSaqueOpen] = useState(false);
  const [valorSaque, setValorSaque] = useState(0);
  const [showSuccessSaque, setShowSuccessSaque] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState(null);

  // Dados mockados de investimentos ativos
  const investimentosAtivos = [
    {
      id: 1,
      nome: 'Expansão de Restaurante',
      tomador: 'João Silva',
      valorInvestido: 1000,
      prazo: 12,
      dataInicio: '01/01/2025',
      taxaJuros: 2.5,
      categoria: 'Alimentação'
    },
    {
      id: 2,
      nome: 'Reforma de Loja',
      tomador: 'Maria Santos',
      valorInvestido: 2000,
      prazo: 18,
      dataInicio: '14/02/2025',
      taxaJuros: 3.0,
      categoria: 'Varejo'
    },
    {
      id: 3,
      nome: 'Aquisição de Equipamentos',
      tomador: 'Pedro Oliveira',
      valorInvestido: 1500,
      prazo: 6,
      dataInicio: '20/02/2025',
      taxaJuros: 2.0,
      categoria: 'Tecnologia'
    }
  ];

  useEffect(() => {
    // Verificar se usuário está logado e é investidor
    const currentUser = getCurrentUser();
    if (!currentUser || !isInvestor()) {
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

  const handleAbrirModalSaque = () => {
    setValorSaque(0);
    setShowSuccessSaque(false);
    setIsDragging(false);
    setIsModalSaqueOpen(true);
  };

  const handleFecharModalSaque = () => {
    setIsModalSaqueOpen(false);
    setShowSuccessSaque(false);
    setValorSaque(0);
    setIsDragging(false);
  };

  const handleConfirmarSaque = () => {
    if (!valorSaque || valorSaque <= 0 || valorSaque > saldoDisponivel) {
      setToast({ 
        message: `O valor deve estar entre R$ 0,01 e ${formatarMoeda(saldoDisponivel)}`, 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setShowSuccessSaque(true);
    
    setTimeout(() => {
      setSaldoDisponivel(saldoDisponivel - valorSaque);
      setIsModalSaqueOpen(false);
      setShowSuccessSaque(false);
      setValorSaque(0);
      setIsDragging(false);
      setToast({ 
        message: 'Saque feito com sucesso!', 
        type: 'success' 
      });
      setTimeout(() => setToast(null), 4000);
    }, 2500);
  };

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setValorSaque(newValue);
  };

  const getSliderPercentage = () => {
    if (saldoDisponivel === 0) return 0;
    return (valorSaque / saldoDisponivel) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarInvestidor user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Olá, investidor!
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
          {/* Top Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Saldo Disponível */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm opacity-80 mb-2">Saldo disponível</h3>
                  <p className="text-3xl font-bold">{formatarMoeda(saldoDisponivel)}</p>
                </div>
                <button 
                  onClick={handleAbrirModalSaque}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
                >
                  Sacar
                </button>
              </div>
              
              {/* Gráfico simples */}
              <div className="flex items-end space-x-1 mb-4">
                <div className="w-2 bg-white/40 h-8"></div>
                <div className="w-2 bg-white/60 h-12"></div>
                <div className="w-2 bg-white/80 h-16"></div>
                <div className="w-2 bg-white h-10"></div>
              </div>
              <div className="text-xs opacity-60">jul ago set out</div>
              
              {/* Moedas decorativas */}
              <div className="absolute top-4 right-4 text-2xl opacity-30">
                💰💰💰
              </div>
            </div>

            {/* Rentabilidade */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white">
              <h3 className="text-sm opacity-80 mb-2">Rentabilidade</h3>
              <p className="text-3xl font-bold">2.4%</p>
            </div>

            {/* Total Investido */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white">
              <h3 className="text-sm opacity-80 mb-2">Total investido</h3>
              <p className="text-3xl font-bold">R$ 10.000,00</p>
            </div>
          </div>

          {/* Investimentos Ativos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-6">
              Investimentos ativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investimentosAtivos.map((investimento) => (
                <div
                  key={investimento.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-purple-dark text-lg mb-1">
                        {investimento.nome}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {investimento.tomador}
                      </p>
                    </div>
                    <span className="bg-brand-pink/10 text-brand-pink text-xs px-3 py-1 rounded-full font-semibold">
                      {investimento.categoria}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Investido:</span>
                      <span className="text-sm font-bold text-brand-purple-dark">
                        {formatarMoeda(investimento.valorInvestido)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {investimento.taxaJuros}% a.m.
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prazo:</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {investimento.prazo} meses
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Início:</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {investimento.dataInicio}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extrato e Movimentações */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-4">
              Extrato e movimentações
            </h2>
            
            {/* Filtros */}
            <div className="flex space-x-4 mb-6">
              <select className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-pink">
                <option>Período</option>
                <option>Último mês</option>
                <option>Últimos 3 meses</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-pink">
                <option>Tipo</option>
                <option>Investimento</option>
                <option>Resgate</option>
              </select>
            </div>

            {/* Movimentações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-brand-pink/20 rounded"></div>
                  <span className="text-gray-800">XXXXXXXXXXXXXXXX</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800">R$ 520,00</span>
                  <div className="w-2 h-8 bg-brand-pink rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-6 bg-brand-pink/20 rounded"></div>
                  <span className="text-gray-800">XXXXXXXXXXXXXXXXXXXX</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800">R$ 150,00</span>
                  <div className="w-2 h-6 bg-brand-pink rounded"></div>
                </div>
              </div>
            </div>

            {/* Botões de Relatório */}
            <div className="flex space-x-4 mt-6">
              <button className="bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                <span>📄</span>
                <span>Relatório de Imposto de Renda</span>
              </button>
              <button className="bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                <span>📊</span>
                <span>Relatório de Carteira</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Saque */}
      {isModalSaqueOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleFecharModalSaque}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {!showSuccessSaque ? (
              <>
                {/* Header do Modal */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-brand-purple-dark">
                    Realizar Saque
                  </h2>
                  <button
                    onClick={handleFecharModalSaque}
                    className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Informações do Saldo */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-brand-pink/10 to-brand-purple-dark/10 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Saldo Disponível:</span>
                      <span className="text-lg font-bold text-brand-purple-dark">
                        {formatarMoeda(saldoDisponivel)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Slider de Valor */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                    Valor do Saque
                  </label>
                  
                  {/* Valor Exibido */}
                  <div className="text-center mb-6">
                    <div className={`inline-block transition-all duration-500 ease-out ${isDragging ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}`}>
                      <div className={`bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white px-8 py-4 rounded-2xl shadow-xl relative overflow-hidden ${isDragging ? 'shadow-2xl shadow-brand-pink/50' : ''}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
                        <p className="text-3xl font-bold relative z-10">
                          {formatarMoeda(valorSaque)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Slider Container */}
                  <div className="relative">
                    <div className="h-4 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-pink via-brand-purple-dark to-brand-pink rounded-full transition-all duration-500 ease-out overflow-hidden"
                        style={{
                          width: `${getSliderPercentage()}%`,
                          backgroundSize: '200% 100%',
                          animation: isDragging ? 'gradient-shift 1.5s ease infinite' : 'none'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
                        <div className={`absolute inset-0 bg-white transition-opacity duration-300 ${isDragging ? 'opacity-30 animate-pulse' : 'opacity-0'}`}></div>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={saldoDisponivel}
                      step={50}
                      value={valorSaque}
                      onChange={handleSliderChange}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchEnd={() => setIsDragging(false)}
                      className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer z-10 -mt-1"
                      style={{ WebkitAppearance: 'none', appearance: 'none' }}
                    />

                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>R$ 0,00</span>
                      <span>{formatarMoeda(saldoDisponivel)}</span>
                    </div>

                    {/* Indicador visual */}
                    <div
                      className="absolute top-0 left-0 transform -translate-y-1/2 transition-all duration-500 ease-out pointer-events-none"
                      style={{ left: `calc(${getSliderPercentage()}% - 14px)` }}
                    >
                      <div className={`relative ${isDragging ? 'scale-150' : 'scale-100'} transition-all duration-300 ease-out`}>
                        <div className="w-7 h-7 bg-white border-4 border-brand-pink rounded-full shadow-xl flex items-center justify-center relative z-10">
                          <div className="w-2.5 h-2.5 bg-brand-pink rounded-full"></div>
                          <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
                        </div>
                        {isDragging && (
                          <>
                            <div className="absolute inset-0 w-7 h-7 bg-brand-pink rounded-full animate-ping opacity-60"></div>
                            <div className="absolute inset-0 w-7 h-7 bg-brand-pink rounded-full animate-ping opacity-40" style={{ animationDelay: '0.2s' }}></div>
                            <div className="absolute inset-0 w-7 h-7 bg-brand-pink rounded-full animate-ping opacity-20" style={{ animationDelay: '0.4s' }}></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botões de incremento rápido */}
                  <div className="flex justify-center gap-3 mt-6 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const step = saldoDisponivel / 4;
                        setValorSaque(Math.max(0, valorSaque - step));
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                    >
                      -25%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const meio = saldoDisponivel / 2;
                        setValorSaque(meio);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const step = saldoDisponivel / 4;
                        setValorSaque(Math.min(saldoDisponivel, valorSaque + step));
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                    >
                      +25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setValorSaque(saldoDisponivel)}
                      className="px-4 py-2 bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 hover:from-brand-purple-dark hover:to-brand-pink"
                    >
                      Máximo
                    </button>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleFecharModalSaque}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarSaque}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Confirmar Saque</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-purple-dark to-brand-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </>
            ) : (
              /* Tela de Sucesso */
              <div className="text-center" style={{ animation: 'fadeInScale 0.5s ease-out' }}>
                <div className="mb-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-brand-pink/20 to-brand-purple-dark/20 rounded-full animate-ping"></div>
                    <div className="absolute w-28 h-28 bg-gradient-to-r from-brand-pink/30 to-brand-purple-dark/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl" style={{ animation: 'scaleInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    <svg
                      className="w-16 h-16 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ animation: 'checkmark 0.5s ease-out 0.3s both' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={4}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-pink to-brand-purple-dark bg-clip-text text-transparent mb-4" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
                  Saque feito com sucesso!
                </h2>
                <p className="text-gray-700 mb-2 text-lg font-semibold" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
                  Você sacou <span className="text-brand-pink font-bold">{formatarMoeda(valorSaque)}</span>
                </p>
                <p className="text-sm text-gray-500" style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}>
                  O valor será creditado em sua conta em até 2 dias úteis
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
