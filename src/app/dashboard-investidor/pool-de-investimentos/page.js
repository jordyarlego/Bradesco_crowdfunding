'use client';

// src/app/dashboard-investidor/pool-de-investimentos/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isInvestor } from '../../utils/auth';
import SidebarInvestidor from '../../components/SidebarInvestidor';

export default function PoolDeInvestimentos() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvestimento, setSelectedInvestimento] = useState(null);
  const [valorInvestimento, setValorInvestimento] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState(null);

  // Dados mockados de investimentos
  const investimentos = [
    {
      id: 1,
      nome: 'Expansão de Restaurante',
      tomador: 'João Silva',
      valorTotal: 50000,
      valorMinimo: 1000,
      taxaJuros: 2.5,
      prazo: 12,
      valorArrecadado: 35000,
      categoria: 'Alimentação',
      descricao: 'Expansão de restaurante familiar no centro da cidade'
    },
    {
      id: 2,
      nome: 'Reforma de Loja',
      tomador: 'Maria Santos',
      valorTotal: 80000,
      valorMinimo: 2000,
      taxaJuros: 3.0,
      prazo: 18,
      valorArrecadado: 45000,
      categoria: 'Varejo',
      descricao: 'Reforma completa de loja de roupas em shopping'
    },
    {
      id: 3,
      nome: 'Aquisição de Equipamentos',
      tomador: 'Pedro Oliveira',
      valorTotal: 30000,
      valorMinimo: 500,
      taxaJuros: 2.0,
      prazo: 6,
      valorArrecadado: 18000,
      categoria: 'Tecnologia',
      descricao: 'Aquisição de equipamentos para startup de tecnologia'
    },
    {
      id: 4,
      nome: 'Abertura de Filial',
      tomador: 'Ana Costa',
      valorTotal: 120000,
      valorMinimo: 5000,
      taxaJuros: 2.8,
      prazo: 24,
      valorArrecadado: 95000,
      categoria: 'Serviços',
      descricao: 'Abertura de nova filial de empresa de serviços'
    },
    {
      id: 5,
      nome: 'Modernização de Fábrica',
      tomador: 'Carlos Mendes',
      valorTotal: 200000,
      valorMinimo: 10000,
      taxaJuros: 3.5,
      prazo: 36,
      valorArrecadado: 120000,
      categoria: 'Indústria',
      descricao: 'Modernização de linha de produção industrial'
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

  const calcularPercentual = (arrecadado, total) => {
    return ((arrecadado / total) * 100).toFixed(1);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleInvestirClick = (investimento) => {
    setSelectedInvestimento(investimento);
    setValorInvestimento(investimento.valorMinimo);
    setShowQRCode(false);
    setShowSuccess(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleConfirmar = () => {
    const valor = valorInvestimento;
    const valorMin = selectedInvestimento.valorMinimo;
    const valorMax = selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado;

    if (!valor || isNaN(valor) || valor < valorMin || valor > valorMax) {
      showToast(`O valor deve estar entre ${formatarMoeda(valorMin)} e ${formatarMoeda(valorMax)}`, 'error');
      return;
    }

    setShowQRCode(true);
    setShowSuccess(false);

    // Após 3 segundos, mostrar animação de sucesso
    setTimeout(() => {
      setShowQRCode(false);
      setShowSuccess(true);
      
      // Fechar modal após 2.5 segundos mostrando sucesso
      setTimeout(() => {
        setIsModalOpen(false);
        setShowSuccess(false);
        setShowQRCode(false);
        setSelectedInvestimento(null);
        setValorInvestimento(0);
      }, 2500);
    }, 3000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowQRCode(false);
    setShowSuccess(false);
    setSelectedInvestimento(null);
    setValorInvestimento(0);
    setIsDragging(false);
  };

  const handleSliderChange = (e) => {
    if (!selectedInvestimento) return;
    const valorMin = selectedInvestimento.valorMinimo;
    const valorMax = selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado;
    const newValue = parseFloat(e.target.value);
    setValorInvestimento(newValue);
  };

  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
  };

  const getSliderPercentage = () => {
    if (!selectedInvestimento) return 0;
    const valorMin = selectedInvestimento.valorMinimo;
    const valorMax = selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado;
    return ((valorInvestimento - valorMin) / (valorMax - valorMin)) * 100;
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
            Pool de Investimentos
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar investimentos..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <p className="text-gray-600">
              Explore todas as oportunidades de investimento disponíveis na plataforma
            </p>
          </div>

          {/* Grid de Investimentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investimentos.map((investimento) => {
              const percentual = calcularPercentual(investimento.valorArrecadado, investimento.valorTotal);
              
              return (
                <div
                  key={investimento.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  {/* Header do Card */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-brand-purple-dark">
                        {investimento.nome}
                      </h3>
                      <span className="bg-brand-pink/10 text-brand-pink text-xs px-3 py-1 rounded-full font-semibold">
                        {investimento.categoria}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tomador: {investimento.tomador}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {investimento.descricao}
                    </p>
                  </div>

                  {/* Informações Financeiras */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor Total:</span>
                      <span className="text-sm font-bold text-brand-purple-dark">
                        {formatarMoeda(investimento.valorTotal)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor Mínimo:</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatarMoeda(investimento.valorMinimo)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Juros:</span>
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
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Progresso</span>
                      <span className="text-xs font-semibold text-brand-purple-dark">
                        {percentual}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand-pink to-brand-purple-dark h-2 rounded-full transition-all"
                        style={{ width: `${percentual}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {formatarMoeda(investimento.valorArrecadado)} arrecadado
                      </span>
                      <span className="text-xs text-gray-500">
                        Faltam {formatarMoeda(investimento.valorTotal - investimento.valorArrecadado)}
                      </span>
                    </div>
                  </div>

                  {/* Botão de Investir */}
                  <button 
                    onClick={() => handleInvestirClick(investimento)}
                    className="w-full bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white py-3 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Investir Agora
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Modal de Investimento */}
      {isModalOpen && selectedInvestimento && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {!showQRCode && !showSuccess && (
              <>
                {/* Header do Modal */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-brand-purple-dark">
                    Investir em {selectedInvestimento.nome}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Informações do Investimento */}
                <div className="mb-6 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Tomador:</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedInvestimento.tomador}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Taxa de Juros:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {selectedInvestimento.taxaJuros}% a.m.
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prazo:</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedInvestimento.prazo} meses
                      </span>
                    </div>
                  </div>
                </div>

                {/* Valores Mínimo e Máximo */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor Mínimo</p>
                      <p className="text-lg font-bold text-brand-purple-dark">
                        {formatarMoeda(selectedInvestimento.valorMinimo)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Valor Máximo Disponível</p>
                      <p className="text-lg font-bold text-brand-purple-dark">
                        {formatarMoeda(selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slider de Valor */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                    Valor do Investimento
                  </label>
                  
                  {/* Valor Exibido */}
                  <div className="text-center mb-6">
                    <div className={`inline-block transition-all duration-500 ease-out ${isDragging ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}`}>
                      <div className={`bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white px-8 py-4 rounded-2xl shadow-xl relative overflow-hidden ${isDragging ? 'shadow-2xl shadow-brand-pink/50' : ''}`}>
                        {/* Efeito de brilho animado */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
                        <p className="text-3xl font-bold relative z-10">
                          {formatarMoeda(valorInvestimento)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Slider Container */}
                  <div className="relative">
                    {/* Track de fundo */}
                    <div className="h-4 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                      {/* Track preenchido com gradiente animado */}
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-pink via-brand-purple-dark to-brand-pink rounded-full transition-all duration-500 ease-out overflow-hidden"
                        style={{
                          width: `${getSliderPercentage()}%`,
                          backgroundSize: '200% 100%',
                          animation: isDragging ? 'gradient-shift 1.5s ease infinite' : 'none'
                        }}
                      >
                        {/* Efeito de brilho animado */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
                        {/* Efeito de pulso suave */}
                        <div className={`absolute inset-0 bg-white transition-opacity duration-300 ${isDragging ? 'opacity-30 animate-pulse' : 'opacity-0'}`}></div>
                      </div>
                    </div>

                    {/* Slider Input */}
                    <input
                      type="range"
                      min={selectedInvestimento.valorMinimo}
                      max={selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado}
                      step={100}
                      value={valorInvestimento}
                      onChange={handleSliderChange}
                      onMouseDown={handleSliderMouseDown}
                      onMouseUp={handleSliderMouseUp}
                      onTouchStart={handleSliderMouseDown}
                      onTouchEnd={handleSliderMouseUp}
                      className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer z-10 -mt-1"
                      style={{ WebkitAppearance: 'none', appearance: 'none' }}
                    />

                    {/* Marcadores */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{formatarMoeda(selectedInvestimento.valorMinimo)}</span>
                      <span>{formatarMoeda(selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado)}</span>
                    </div>

                    {/* Indicador visual do valor */}
                    <div
                      className="absolute top-0 left-0 transform -translate-y-1/2 transition-all duration-500 ease-out pointer-events-none"
                      style={{ left: `calc(${getSliderPercentage()}% - 14px)` }}
                    >
                      <div className={`relative ${isDragging ? 'scale-150' : 'scale-100'} transition-all duration-300 ease-out`}>
                        {/* Círculo do slider */}
                        <div className="w-7 h-7 bg-white border-4 border-brand-pink rounded-full shadow-xl flex items-center justify-center relative z-10">
                          <div className="w-2.5 h-2.5 bg-brand-pink rounded-full"></div>
                          {/* Brilho interno */}
                          <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
                        </div>
                        {/* Efeito de pulso quando arrastando */}
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
                        const valorMin = selectedInvestimento.valorMinimo;
                        const valorMax = selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado;
                        const step = (valorMax - valorMin) / 4;
                        setValorInvestimento(Math.max(valorMin, valorInvestimento - step));
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                    >
                      -25%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const valorMin = selectedInvestimento.valorMinimo;
                        const valorMax = selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado;
                        const meio = (valorMin + valorMax) / 2;
                        setValorInvestimento(meio);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const valorMin = selectedInvestimento.valorMinimo;
                        const valorMax = selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado;
                        const step = (valorMax - valorMin) / 4;
                        setValorInvestimento(Math.min(valorMax, valorInvestimento + step));
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                    >
                      +25%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const valorMax = selectedInvestimento.valorTotal - selectedInvestimento.valorArrecadado;
                        setValorInvestimento(valorMax);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 hover:from-brand-purple-dark hover:to-brand-pink"
                    >
                      Máximo
                    </button>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmar}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Confirmar</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-purple-dark to-brand-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </>
            )}

            {/* Tela de QR Code */}
            {showQRCode && !showSuccess && (
              <div className="text-center" style={{ animation: 'fadeInScale 0.5s ease-out' }}>
                <h2 className="text-2xl font-bold text-brand-purple-dark mb-6 animate-pulse">
                  Escaneie o QR Code para confirmar
                </h2>
                <div className="bg-white p-6 rounded-lg inline-block mb-6 border-4 border-gray-200 shadow-2xl relative overflow-hidden" style={{ animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  {/* Efeito de brilho rotativo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-pink/10 to-transparent transform -skew-x-12 animate-shimmer"></div>
                  {/* QR Code Falso */}
                  <div className="w-64 h-64 bg-white flex items-center justify-center relative border-2 border-gray-300" style={{ display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: '1px', padding: '8px' }}>
                    {Array.from({ length: 625 }).map((_, i) => {
                      const row = Math.floor(i / 25);
                      const col = i % 25;
                      // Criar padrão simétrico que parece QR code
                      const isBlack = 
                        // Cantos superiores esquerdo e direito
                        (row < 7 && col < 7) || (row < 7 && col >= 18) ||
                        // Canto inferior esquerdo
                        (row >= 18 && col < 7) ||
                        // Padrão no meio (mas fixo)
                        ((row * 7 + col * 11) % 3 === 0 && row >= 7 && row < 18 && col >= 7 && col < 18) ||
                        // Linhas e colunas estratégicas
                        row === 0 || row === 24 || col === 0 || col === 24 ||
                        row === 6 || row === 18 || col === 6 || col === 18;
                      return (
                        <div
                          key={i}
                          className={isBlack ? 'bg-black' : 'bg-white'}
                          style={{ aspectRatio: '1' }}
                        />
                      );
                    })}
                    {/* Marcadores de posição (cantos) */}
                    <div className="absolute top-2 left-2 w-20 h-20 border-4 border-black pointer-events-none">
                      <div className="absolute top-1 left-1 w-14 h-14 border-4 border-black"></div>
                      <div className="absolute top-4 left-4 w-6 h-6 bg-black"></div>
                    </div>
                    <div className="absolute top-2 right-2 w-20 h-20 border-4 border-black pointer-events-none">
                      <div className="absolute top-1 right-1 w-14 h-14 border-4 border-black"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 bg-black"></div>
                    </div>
                    <div className="absolute bottom-2 left-2 w-20 h-20 border-4 border-black pointer-events-none">
                      <div className="absolute bottom-1 left-1 w-14 h-14 border-4 border-black"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 bg-black"></div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 animate-pulse">
                  Processando pagamento...
                </p>
              </div>
            )}

            {/* Tela de Sucesso */}
            {showSuccess && (
              <div className="text-center" style={{ animation: 'fadeInScale 0.5s ease-out' }}>
                <div className="mb-6 relative">
                  {/* Círculo de fundo animado */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-brand-pink/20 to-brand-purple-dark/20 rounded-full animate-ping"></div>
                    <div className="absolute w-28 h-28 bg-gradient-to-r from-brand-pink/30 to-brand-purple-dark/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  {/* Ícone de sucesso */}
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
                  Investimento feito com sucesso!
                </h2>
                <p className="text-gray-700 mb-2 text-lg font-semibold" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
                  Você investiu <span className="text-brand-pink font-bold">{formatarMoeda(valorInvestimento)}</span>
                </p>
                <p className="text-sm text-gray-500" style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}>
                  Obrigado por investir em {selectedInvestimento.nome}
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

