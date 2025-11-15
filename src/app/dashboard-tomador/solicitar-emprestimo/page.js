'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SidebarTomador from '../../components/SidebarTomador';
import { getCurrentUser, isBorrower } from '../../utils/auth';

function calcularJuros(valor, parcelas) {
  let taxa = 0.02;
  if (parcelas > 12 && parcelas <= 24) taxa = 0.025;
  else if (parcelas > 24 && parcelas <= 36) taxa = 0.03;
  else if (parcelas > 36) taxa = 0.035;
  const valorParcela = (valor * Math.pow(1 + taxa, parcelas)) / parcelas;
  const total = valorParcela * parcelas;
  return { taxa, valorParcela, total };
}

export default function SolicitarEmprestimo() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [valor, setValor] = useState(1000);
  const [parcelas, setParcelas] = useState(12);
  const [valorParcela, setValorParcela] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showModalSimulacao, setShowModalSimulacao] = useState(false);
  const [showModalAnalise, setShowModalAnalise] = useState(false);
  const [showModalAceito, setShowModalAceito] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isBorrower()) {
      router.push('/entrar');
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
    const { valorParcela: vp } = calcularJuros(valor, parcelas);
    setValorParcela(vp);
  }, [router, valor, parcelas]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleValorChange = (e) => {
    const newValor = parseFloat(e.target.value);
    setValor(newValor);
    const { valorParcela: vp } = calcularJuros(newValor, parcelas);
    setValorParcela(vp);
  };

  const handleParcelasChange = (e) => {
    const novoParcelas = Number(e.target.value);
    setParcelas(novoParcelas);
    const { valorParcela: vp } = calcularJuros(valor, novoParcelas);
    setValorParcela(vp);
  };

  const handleAbrirSimulacao = () => {
    if (valor < 1000) {
      setToast({ 
        message: 'O valor mínimo é de R$ 1.000,00', 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setShowModalSimulacao(true);
  };

  const handleSolicitar = () => {
    setShowModalSimulacao(false);
    setShowModalAnalise(true);
    
    // Após 3 segundos, mostrar modal de aceito
    setTimeout(() => {
      setShowModalAnalise(false);
      setShowModalAceito(true);
    }, 3000);
  };

  const handleFecharAceito = () => {
    setShowModalAceito(false);
    router.push('/dashboard-tomador/emprestimo-ativo');
  };

  const { taxa, total } = calcularJuros(valor, parcelas);
  const getValorPercentage = () => (valor / 50000) * 100;
  const getParcelasPercentage = () => ((parcelas - 6) / (48 - 6)) * 100;

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
              Solicitar Empréstimo
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card Principal */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-pink/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-brand-pink to-brand-purple-dark rounded-full flex items-center justify-center">
                    <Image src="/logo.png" alt="Logo" width={28} height={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-purple-dark">
                    Simule seu Empréstimo
                  </h2>
                </div>

                {/* Valor do Empréstimo */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Valor do Empréstimo
                  </label>
                  
                  {/* Valor Exibido */}
                  <div className="text-center mb-6">
                    <div className={`inline-block transition-all duration-500 ease-out ${isDragging ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}`}>
                      <div className={`bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white px-8 py-4 rounded-2xl shadow-xl relative overflow-hidden ${isDragging ? 'shadow-2xl shadow-brand-pink/50' : ''}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
                        <p className="text-3xl font-bold relative z-10">
                          {formatarMoeda(valor)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="relative">
                    <div className="h-4 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-pink via-brand-purple-dark to-brand-pink rounded-full transition-all duration-500 ease-out overflow-hidden"
                        style={{
                          width: `${getValorPercentage()}%`,
                          backgroundSize: '200% 100%',
                          animation: isDragging ? 'gradient-shift 1.5s ease infinite' : 'none'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={50000}
                      step={100}
                      value={valor}
                      onChange={handleValorChange}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer z-10 -mt-1"
                      style={{ WebkitAppearance: 'none', appearance: 'none' }}
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>R$ 1.000,00</span>
                      <span>R$ 50.000,00</span>
                    </div>
                  </div>
                </div>

                {/* Número de Parcelas */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Número de Parcelas: <span className="text-brand-pink font-bold">{parcelas}x</span>
                  </label>
                  <div className="relative">
                    <div className="h-4 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-pink via-brand-purple-dark to-brand-pink rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${getParcelasPercentage()}%` }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={48}
                      step={1}
                      value={parcelas}
                      onChange={handleParcelasChange}
                      className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer z-10 -mt-1"
                      style={{ WebkitAppearance: 'none', appearance: 'none' }}
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>6x</span>
                      <span>48x</span>
                    </div>
                  </div>
                </div>

                {/* Resumo */}
                <div className="bg-gradient-to-r from-brand-pink/10 to-brand-purple-dark/10 rounded-xl p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Taxa de Juros:</span>
                      <span className="text-sm font-bold text-green-600">
                        {(taxa * 100).toFixed(2)}% a.m.
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valor da Parcela:</span>
                      <span className="text-sm font-bold text-brand-purple-dark">
                        {formatarMoeda(valorParcela)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-700">Total a Pagar:</span>
                      <span className="font-bold text-brand-pink text-lg">
                        {formatarMoeda(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão */}
                <button
                  onClick={handleAbrirSimulacao}
                  disabled={valor < 1000}
                  className="w-full bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={24} height={24} />
                    Continuar
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-purple-dark to-brand-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Card de Informações */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6">Por que escolher?</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Aprovação Rápida</h4>
                      <p className="text-sm opacity-90">Análise em até 24 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Taxas Competitivas</h4>
                      <p className="text-sm opacity-90">A partir de 2% ao mês</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Sem Burocracia</h4>
                      <p className="text-sm opacity-90">Processo 100% digital</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Image 
                    src="/emprestimo.png" 
                    alt="Empréstimo" 
                    width={300} 
                    height={300} 
                    className="object-contain mx-auto opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Simulação */}
      {showModalSimulacao && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowModalSimulacao(false)}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-purple-dark">
                Confirme seus dados
              </h2>
              <button
                onClick={() => setShowModalSimulacao(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valor Solicitado:</span>
                    <span className="text-sm font-bold text-brand-purple-dark">
                      {formatarMoeda(valor)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Parcelas:</span>
                    <span className="text-sm font-bold text-brand-purple-dark">
                      {parcelas}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taxa de Juros:</span>
                    <span className="text-sm font-bold text-green-600">
                      {(taxa * 100).toFixed(2)}% a.m.
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-700">Valor da Parcela:</span>
                    <span className="font-bold text-brand-pink">
                      {formatarMoeda(valorParcela)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Total a Pagar:</span>
                    <span className="font-bold text-brand-pink text-lg">
                      {formatarMoeda(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowModalSimulacao(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Voltar
              </button>
              <button
                onClick={handleSolicitar}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                Solicitar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Em Análise */}
      {showModalAnalise && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl text-center"
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse">
                <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-brand-purple-dark mb-4">
              Empréstimo em Análise
            </h2>
            <p className="text-gray-600 mb-2">
              Estamos analisando sua solicitação...
            </p>
            <p className="text-sm text-gray-500">
              Isso pode levar alguns instantes
            </p>
          </div>
        </div>
      )}

      {/* Modal Aceito com Sucesso */}
      {showModalAceito && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl text-center"
            style={{ animation: 'fadeInScale 0.5s ease-out' }}
          >
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
              Empréstimo Aceito!
            </h2>
            <p className="text-gray-700 mb-2 text-lg font-semibold" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
              Parabéns! Seu empréstimo de <span className="text-brand-pink font-bold">{formatarMoeda(valor)}</span> foi aprovado
            </p>
            <p className="text-sm text-gray-500 mb-6" style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}>
              Você pode acompanhar o status na página de empréstimo ativo
            </p>
            <button
              onClick={handleFecharAceito}
              className="w-full px-6 py-3 bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              Ver Empréstimo Ativo
            </button>
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
