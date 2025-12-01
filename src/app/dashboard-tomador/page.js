'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../utils/authContext';
import SidebarTomador from '../components/SidebarTomador';
import { emprestimoService } from '@/services/emprestimoService';

// Componente de gráfico circular de progresso
function CircularProgress({ percentage, size = 120, strokeWidth = 8, color = "#D9266F" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// Componente de gráfico de barras
function BarChart({ data, height = 200 }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="relative w-full" style={{ height }}>
            <div className="absolute bottom-0 w-full bg-gray-200 rounded-t-lg" style={{ height: `${height}px` }}></div>
            <div
              className="absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ease-out"
              style={{
                height: `${(item.value / maxValue) * height}px`,
                background: item.color || 'linear-gradient(to top, #D9266F, #F24C92)',
                backgroundColor: item.color || '#D9266F'
              }}
            ></div>
          </div>
          <span className="text-xs text-gray-600 font-semibold">{item.label}</span>
          <span className="text-xs text-brand-pink font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardTomador() {
  const router = useRouter();
  const { usuario, autenticado, loading: authLoading, isBorrower } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [emprestimos, setEmprestimos] = useState([]);
  const [isLoadingEmprestimos, setIsLoadingEmprestimos] = useState(true);
  const [toast, setToast] = useState(null);

  // 1. Validação de autenticação
  useEffect(() => {
    if (authLoading) return;

    if (!autenticado) {
      router.push("/entrar");
      return;
    }

    if (!usuario) return;

    if (!isBorrower()) {
      router.push("/entrar");
      return;
    }

    setIsLoading(false);
  }, [autenticado, authLoading, usuario, router]);

  // 2. Buscar empréstimos
  useEffect(() => {
    const fetchData = async () => {
      if (!autenticado || !usuario) return;

      try {
        setIsLoadingEmprestimos(true);

        const response = await emprestimoService.listarEmprestimosPorTomador(
          usuario.id,
          usuario.token
        );

        setEmprestimos(response || []);

      } catch (error) {
        console.error("Erro ao buscar empréstimos:", error);

        setToast({
          type: "error",
          message: error.message || "Erro ao carregar seus empréstimos"
        });

        if (String(error.message).includes("401")) {
          router.push("/entrar");
        }
      } finally {
        setIsLoadingEmprestimos(false);
      }
    };

    fetchData();
  }, [autenticado, usuario, router]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    if (!emprestimos.length) {
      return {
        totalEmprestimos: 0,
        valorTotal: 0,
        saldoTotal: 0,
        valorPago: 0,
        progressoMedio: 0
      };
    }

    const valorTotal = emprestimos.reduce((acc, emp) => acc + (emp.montante || 0), 0);
    const saldoTotal = emprestimos.reduce((acc, emp) => acc + (emp.saldoDevedor || 0), 0);
    const valorPago = valorTotal - saldoTotal;
    const progressoMedio = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;

    return {
      totalEmprestimos: emprestimos.length,
      valorTotal,
      saldoTotal,
      valorPago,
      progressoMedio
    };
  }, [emprestimos]);

  // Calcular progresso de cada empréstimo
  const calcularProgresso = (emp) => {
    if (!emp.montante || emp.montante === 0) return 0;
    const pago = emp.montante - (emp.saldoDevedor || 0);
    return Math.max(0, Math.min(100, (pago / emp.montante) * 100));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  const formatarMoeda = (v) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <SidebarTomador user={usuario} />

      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-lg px-8 py-6 flex items-center justify-between shadow-lg border-b border-gray-200">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent">
              Olá, {usuario?.nome?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Gerencie seus empréstimos de forma simples</p>
          </div>

          <button
            onClick={() => router.push('/dashboard-tomador/solicitar-emprestimo')}
            className="bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
            style={{ animationDelay: "0.1s" }}
          >
            + Solicitar Empréstimo
          </button>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Toast */}
          {toast && (
            <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-2xl z-50 animate-slideUp ${
              toast.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
            }`}>
              <div className="flex items-center gap-3">
                {toast.type === 'error' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="font-semibold">{toast.message}</span>
              </div>
            </div>
          )}

          {/* Cards de Estatísticas */}
          {emprestimos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeInUp">
              <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm opacity-80 font-semibold">Total de Empréstimos</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold">{estatisticas.totalEmprestimos}</p>
              </div>

              <div className="bg-gradient-to-br from-brand-pink to-brand-pink-light rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm opacity-80 font-semibold">Valor Total</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold">{formatarMoeda(estatisticas.valorTotal)}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm opacity-80 font-semibold">Saldo Devedor</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold">{formatarMoeda(estatisticas.saldoTotal)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm opacity-80 font-semibold">Progresso Médio</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold">{Math.round(estatisticas.progressoMedio)}%</p>
              </div>
            </div>
          )}

          {/* CARD — Empréstimos */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent">
                  Seus Empréstimos
                </h2>
                <p className="text-gray-600 mt-1">Visualize e gerencie todos os seus empréstimos</p>
              </div>
            </div>

            {isLoadingEmprestimos ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-brand-purple-dark/20 border-t-brand-purple-dark rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-semibold">Carregando empréstimos...</span>
                </div>
              </div>
            ) : emprestimos.length === 0 ? (
              <div className="text-center py-16 animate-fadeInUp">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-brand-pink/20 to-brand-purple-dark/20 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">
                  Você ainda não possui empréstimos.
                </p>
                <p className="text-gray-500 mb-6">Solicite seu primeiro empréstimo agora!</p>
                <button
                  className="bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => router.push('/dashboard-tomador/solicitar-emprestimo')}
                >
                  Solicitar Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {emprestimos.map((emp, index) => {
                  const progresso = calcularProgresso(emp);
                  const valorPago = (emp.montante || 0) - (emp.saldoDevedor || 0);
                  
                  return (
                    <div
                      key={emp.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-brand-pink/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Header do Card */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-brand-purple-dark mb-1">
                            Empréstimo #{emp.codigoTransacao || emp.id}
                          </h3>
                          <span className="text-xs text-gray-500 font-semibold">
                            {emp.status || 'Ativo'}
                          </span>
                        </div>
                        <CircularProgress 
                          percentage={progresso} 
                          size={80} 
                          strokeWidth={6}
                          color="#D9266F"
                        />
                      </div>

                      {/* Informações Principais */}
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-brand-pink/10 to-brand-purple-dark/10 rounded-xl">
                          <span className="text-gray-700 font-semibold">Valor Solicitado:</span>
                          <span className="text-xl font-bold text-brand-pink">
                            {formatarMoeda(emp.montante || 0)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl">
                          <span className="text-gray-700 font-semibold">Saldo Devedor:</span>
                          <span className="text-xl font-bold text-orange-600">
                            {formatarMoeda(emp.saldoDevedor || 0)}
                          </span>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-semibold">Progresso do Pagamento</span>
                            <span className="text-brand-pink font-bold">{Math.round(progresso)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-pink to-brand-purple-dark rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${progresso}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Pago: {formatarMoeda(valorPago)}</span>
                            <span>Restante: {formatarMoeda(emp.saldoDevedor || 0)}</span>
                          </div>
                        </div>

                        {/* Informações Secundárias */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-600 mb-1">Taxa de Juros</p>
                            <p className="text-lg font-bold text-brand-purple-dark">{emp.juros || 0}% a.m.</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-600 mb-1">Parcelas</p>
                            <p className="text-lg font-bold text-brand-purple-dark">{emp.prazo || 0}x</p>
                          </div>
                        </div>
                      </div>

                      {/* Botão Ver Detalhes */}
                      <button
                        className="w-full bg-gradient-to-r from-brand-purple-dark to-brand-pink hover:from-brand-pink hover:to-brand-purple-dark text-white py-4 px-6 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                        onClick={() =>
                          router.push(`/dashboard-tomador/emprestimo-ativo/${emp.id.toString()}`)
                        }
                      >
                        <span>Ver Detalhes</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
