"use client";

import { useState, useEffect, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../utils/authContext";
import SidebarInvestidor from "../components/SidebarInvestidor";
import { investimentoService } from "@/services/investimentoService";
import { aplicacaoService } from "@/services/aplicacaoService";
import { usuarioService } from "@/services/usuarioService";

// Componente de QR Code visual
function QRCodeDisplay({ value, size = 200 }) {
  // Gerar um padrão visual de QR code (simulado)
  const generateQRPattern = () => {
    const gridSize = 25;
    const cells = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Padrão simulado baseado na posição
        const shouldFill =
          (i * gridSize + j) % 3 === 0 ||
          i === 0 ||
          i === gridSize - 1 ||
          j === 0 ||
          j === gridSize - 1 ||
          (i < 7 && j < 7) ||
          (i < 7 && j >= gridSize - 7) ||
          (i >= gridSize - 7 && j < 7);
        cells.push(shouldFill);
      }
    }
    return cells;
  };

  const cells = generateQRPattern();
  const cellSize = size / 25;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <svg
        width={size}
        height={size}
        className="border-4 border-gray-800 rounded"
      >
        {cells.map((fill, index) => {
          const row = Math.floor(index / 25);
          const col = index % 25;
          return (
            <rect
              key={index}
              x={col * cellSize}
              y={row * cellSize}
              width={cellSize}
              height={cellSize}
              fill={fill ? "#000000" : "#FFFFFF"}
            />
          );
        })}
      </svg>
    </div>
  );
}

// Componente de gráfico circular
function CircularProgress({
  percentage,
  size = 100,
  strokeWidth = 8,
  color = "#D9266F",
}) {
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
        <span className="text-sm font-bold" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

export default function DashboardInvestidor() {
  const router = useRouter();

  const { usuario, autenticado, loading, logout } =
    useContext(AuthContext);

  const [saldoDisponivel, setSaldoDisponivel] = useState();
  const [aplicacoesAtivas, setAplicacoesAtivas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Estados para modais
  const [modalDepositar, setModalDepositar] = useState(false);
  const [modalSacar, setModalSacar] = useState(false);
  const [valorDeposito, setValorDeposito] = useState("");
  const [valorSaque, setValorSaque] = useState("");
  const [mostrarQRCodeDeposito, setMostrarQRCodeDeposito] = useState(false);
  const [mostrarQRCodeSaque, setMostrarQRCodeSaque] = useState(false);
  const [transacaoConcluida, setTransacaoConcluida] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!autenticado) {
        router.push("/entrar");
        return;
      }
      carregarDados();
    }
  }, [loading, autenticado, usuario]);

  const carregarDados = async () => {
    const token = localStorage.getItem("authToken");

    try {
      setIsLoading(true);

      const usuarioDados = await usuarioService.buscarPorId(usuario?.id);

      setSaldoDisponivel(usuarioDados?.saldo);

      const aplicacoes = await aplicacaoService.listarPorUsuario(
        usuario?.id,
        token
      );

      const aplicacoesProcessadas = Array.isArray(aplicacoes)
        ? aplicacoes.map((aplicacao) => ({
            ...aplicacao,
            investimento: aplicacao.investimento,

            valorAplicado: parseFloat(aplicacao.valor),
            dataFormatada: new Date(aplicacao.dataCriacao).toLocaleDateString(
              "pt-BR"
            ),
          }))
        : [];

      setAplicacoesAtivas(aplicacoesProcessadas);
    } catch (error) {
      console.error("❌ Erro ao carregar dados do dashboard:", error);

      setToast({
        type: "error",
        message: error.message || "Erro ao carregar dados do investidor.",
      });

      if (
        String(error.message).includes("401") ||
        String(error.message).includes("Token")
      ) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        await logout();
        router.push("/entrar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    const numero = typeof valor === "string" ? parseFloat(valor) : valor;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numero || 0);
  };

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    if (!aplicacoesAtivas.length) {
      return {
        totalInvestido: 0,
        totalAplicacoes: 0,
        retornoEstimado: 0,
      };
    }

    const totalInvestido = aplicacoesAtivas.reduce(
      (acc, aplicacao) => acc + (parseFloat(aplicacao.valor) || 0),
      0
    );

    const retornoEstimado = aplicacoesAtivas.reduce((acc, aplicacao) => {
      const investimento = aplicacao.investimento;
      const juros = (investimento?.juros || 0) / 100;
      const prazo = investimento?.prazo || 1;
      const valor = parseFloat(aplicacao.valor) || 0;
      return acc + (valor * Math.pow(1 + juros, prazo) - valor);
    }, 0);

    return {
      totalInvestido,
      totalAplicacoes: aplicacoesAtivas.length,
      retornoEstimado,
    };
  }, [aplicacoesAtivas]);

  // Handler para depositar
  const handleDepositar = async () => {
    if (!valorDeposito || parseFloat(valorDeposito) <= 0) {
      setToast({ type: "error", message: "Digite um valor válido" });
      return;
    }

    const token = localStorage.getItem("authToken");
    const valor = parseFloat(valorDeposito);
    const novoSaldo = (saldoDisponivel || 0) + valor;

    try {
      // Mostrar QR code
      setMostrarQRCodeDeposito(true);

      // Atualizar saldo na API
      await usuarioService.atualizarSaldo(usuario?.id, novoSaldo, token);

      // Após 4 segundos, mostrar transação concluída
      setTimeout(() => {
        setTransacaoConcluida(true);
        setTimeout(() => {
          setModalDepositar(false);
          setValorDeposito("");
          setMostrarQRCodeDeposito(false);
          setTransacaoConcluida(false);
          setSaldoDisponivel(novoSaldo);
          setToast({
            type: "success",
            message: "Depósito realizado com sucesso!",
          });
        }, 2000);
      }, 4000);
    } catch (error) {
      console.error("❌ Erro ao atualizar saldo:", error);
      setMostrarQRCodeDeposito(false);
      setToast({
        type: "error",
        message:
          error.message || "Erro ao processar depósito. Tente novamente.",
      });
    }
  };

  // Handler para sacar
  const handleSacar = async () => {
    if (!valorSaque || parseFloat(valorSaque) <= 0) {
      setToast({ type: "error", message: "Digite um valor válido" });
      return;
    }

    const valor = parseFloat(valorSaque);
    if (valor > (saldoDisponivel || 0)) {
      setToast({ type: "error", message: "Saldo insuficiente" });
      return;
    }

    const token = localStorage.getItem("authToken");
    const novoSaldo = (saldoDisponivel || 0) - valor;

    try {
      // Mostrar indicador de processamento
      setMostrarQRCodeSaque(true);

      // Atualizar saldo na API
      await usuarioService.atualizarSaldo(usuario?.id, novoSaldo, token);

      // Após 4 segundos, mostrar transação concluída
      setTimeout(() => {
        setTransacaoConcluida(true);
        setTimeout(() => {
          setModalSacar(false);
          setValorSaque("");
          setMostrarQRCodeSaque(false);
          setTransacaoConcluida(false);
          setSaldoDisponivel(novoSaldo);
          setToast({
            type: "success",
            message: "Saque realizado com sucesso!",
          });
        }, 2000);
      }, 4000);
    } catch (error) {
      console.error("❌ Erro ao atualizar saldo:", error);
      setMostrarQRCodeSaque(false);
      setToast({
        type: "error",
        message: error.message || "Erro ao processar saque. Tente novamente.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <SidebarInvestidor user={usuario} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg px-8 py-6 flex items-center justify-between shadow-lg border-b border-gray-200">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent">
              Olá, {usuario?.nome?.split(" ")[0] || "Investidor"}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus investimentos de forma inteligente
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Saldo - Design Moderno e Clean */}
            <div
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-gray-100 shadow-lg animate-fadeInUp"
              style={{ animationDelay: "0.1s" }}
            >
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                Saldo Disponível
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-brand-purple-dark via-brand-pink to-brand-purple-dark bg-clip-text text-transparent">
                {formatarMoeda(saldoDisponivel)}
              </p>
            </div>

            {/* Botões de ação - Paleta do App */}
            <div
              className="flex gap-3 animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <button
                onClick={() => setModalDepositar(true)}
                className="bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 border-2 border-white/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Depositar
              </button>
              <button
                onClick={() => setModalSacar(true)}
                className="bg-white/90 hover:bg-white text-brand-purple-dark px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 border-2 border-brand-pink/30 hover:border-brand-pink"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
                Sacar
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 p-4 rounded-xl shadow-2xl z-50 animate-slideUp ${
                toast.type === "error"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === "error" ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                <span className="font-semibold">{toast.message}</span>
              </div>
            </div>
          )}

          {/* Cards de Estatísticas */}
          {aplicacoesAtivas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeInUp">
              <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm opacity-80 font-semibold">
                    Total Investido
                  </h3>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold">
                  {formatarMoeda(estatisticas.totalInvestido)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-brand-pink to-brand-pink-light rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm opacity-80 font-semibold">
                    Aplicações Ativas
                  </h3>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold">
                  {estatisticas.totalAplicacoes}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm opacity-80 font-semibold">
                    Retorno Estimado
                  </h3>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold">
                  {formatarMoeda(estatisticas.retornoEstimado)}
                </p>
              </div>
            </div>
          )}

          {/* Investimentos Ativos */}
          <div
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 animate-fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent">
                  Investimentos Ativos
                </h2>
                <p className="text-gray-600 mt-1">
                  Visualize e acompanhe seus investimentos
                </p>
              </div>
              {aplicacoesAtivas.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total investido</p>
                  <p className="text-2xl font-bold text-brand-purple-dark">
                    {formatarMoeda(estatisticas.totalInvestido)}
                  </p>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-brand-purple-dark/20 border-t-brand-purple-dark rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-semibold">
                    Carregando investimentos...
                  </span>
                </div>
              </div>
            ) : aplicacoesAtivas.length === 0 ? (
              <div className="text-center py-16 animate-fadeInUp">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-brand-pink/20 to-brand-purple-dark/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-brand-pink"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">
                  Você ainda não possui investimentos.
                </p>
                <p className="text-gray-500 mb-6">
                  Comece a investir agora e multiplique seu dinheiro!
                </p>
                <button
                  onClick={() =>
                    router.push("/dashboard-investidor/pool-de-investimentos")
                  }
                  className="bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Explorar Investimentos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {aplicacoesAtivas.map((aplicacao, index) => {
                  const investimento = aplicacao.investimento;
                  const progresso =
                    investimento?.valor > 0
                      ? Math.min(
                          100,
                          (investimento?.totalInvestido / investimento?.valor) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={aplicacao.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-brand-pink/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-brand-purple-dark mb-1">
                            {investimento?.nome || "Investimento"}
                          </h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {aplicacao.dataFormatada}
                          </span>
                        </div>
                        <CircularProgress
                          percentage={progresso}
                          size={70}
                          strokeWidth={6}
                          color="#D9266F"
                        />
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {investimento?.descricao || "Sem descrição"}
                      </p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-brand-pink/10 to-brand-purple-dark/10 rounded-xl">
                          <span className="text-gray-700 font-semibold">
                            Seu Investimento:
                          </span>
                          <span className="text-xl font-bold text-brand-purple-dark">
                            {formatarMoeda(aplicacao.valor)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-600 mb-1">
                              Taxa de Juros
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {investimento?.juros || 0}% a.m.
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-600 mb-1">Prazo</p>
                            <p className="text-lg font-bold text-brand-purple-dark">
                              {investimento?.prazo || 0} meses
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-semibold">
                              Progresso do Investimento
                            </span>
                            <span className="text-brand-pink font-bold">
                              {Math.round(progresso)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-pink to-brand-purple-dark rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${progresso}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Depositar */}
      {modalDepositar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-brand-pink/20 animate-scaleInBounce">
            {!mostrarQRCodeDeposito && !transacaoConcluida ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-brand-pink to-brand-purple-dark rounded-2xl flex items-center justify-center shadow-xl animate-scaleInBounce">
                    <img src="/logo.png" alt="Projeto" className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent mb-2">
                    Depositar
                  </h2>
                  <p className="text-gray-600">Adicione fundos à sua conta</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      Valor do Depósito
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        R$
                      </span>
                      <input
                        type="number"
                        value={valorDeposito}
                        onChange={(e) => setValorDeposito(e.target.value)}
                        placeholder="0,00"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 focus:outline-none text-xl font-bold transition-all bg-white text-gray-900"
                        style={{
                          color: "#1a202c",
                          fontWeight: 700,
                          fontSize: "1.25rem",
                          background: "#fff",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setModalDepositar(false);
                        setValorDeposito("");
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-300 border-2 border-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDepositar}
                      className="flex-1 bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </>
            ) : mostrarQRCodeDeposito && !transacaoConcluida ? (
              <div className="text-center animate-fadeInUp">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent mb-2">
                  Escaneie o QR Code
                </h2>
                <p className="text-gray-600 mb-6">
                  Use o app do seu banco para escanear
                </p>
                <div className="flex justify-center mb-6 animate-scaleInBounce">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-brand-pink/20">
                    <QRCodeDisplay
                      value={`Depósito: ${formatarMoeda(valorDeposito)}`}
                      size={250}
                    />
                  </div>
                </div>
                <p className="text-gray-600 font-semibold">
                  Processando transação...
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="w-10 h-10 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin"></div>
                </div>
              </div>
            ) : (
              <div className="text-center animate-scaleInBounce">
                <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-brand-pink to-brand-purple-dark rounded-full flex items-center justify-center shadow-xl animate-scaleInBounce">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                      className="animate-checkmark"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent mb-2">
                  Transação Concluída!
                </h2>
                <p className="text-gray-600 text-lg">
                  Seu depósito foi processado com sucesso.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Sacar */}
      {modalSacar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-brand-pink/20 animate-scaleInBounce">
            {!mostrarQRCodeSaque && !transacaoConcluida ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-brand-purple-dark to-brand-pink rounded-2xl flex items-center justify-center shadow-xl animate-scaleInBounce">
                    <img src="/logo.png" alt="Projeto" className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent mb-2">
                    Sacar
                  </h2>
                  <p className="text-gray-600">
                    Escolha o valor que deseja sacar
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      Valor do Saque
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        R$
                      </span>
                      <input
                        type="number"
                        value={valorSaque}
                        onChange={(e) => setValorSaque(e.target.value)}
                        placeholder="0,00"
                        step="0.01"
                        max={saldoDisponivel}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 focus:outline-none text-xl font-bold transition-all bg-white text-gray-900"
                        style={{
                          color: "#1a202c",
                          fontWeight: 700,
                          fontSize: "1.25rem",
                          background: "#fff",
                        }}
                      />
                    </div>
                    <div className="mt-3 p-3 bg-gradient-to-r from-brand-pink/10 to-brand-purple-dark/10 rounded-xl border border-brand-pink/20">
                      <p className="text-sm text-gray-600">
                        Saldo disponível:{" "}
                        <span className="font-bold text-brand-purple-dark">
                          {formatarMoeda(saldoDisponivel)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      Chave PIX para receber
                    </label>
                    <input
                      type="text"
                      placeholder="Digite sua chave PIX"
                      className="w-full py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 focus:outline-none text-lg font-bold transition-all bg-white text-gray-900"
                      style={{
                        color: "#1a202c",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        background: "#fff",
                      }}
                      // Adicione o estado e handler para chave PIX conforme necessário
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setModalSacar(false);
                        setValorSaque("");
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-300 border-2 border-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSacar}
                      className="flex-1 bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </>
            ) : mostrarQRCodeSaque && !transacaoConcluida ? (
              <div className="text-center animate-fadeInUp">
                {/* Não exibe mais QR Code para saque */}
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent mb-2">
                  Realizando transação...
                </h2>
                <p className="text-gray-600 mb-6">
                  Aguarde enquanto processamos seu saque.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="w-10 h-10 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin"></div>
                </div>
              </div>
            ) : (
              <div className="text-center animate-scaleInBounce">
                <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-brand-pink to-brand-purple-dark rounded-full flex items-center justify-center shadow-xl animate-scaleInBounce">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                      className="animate-checkmark"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-pink bg-clip-text text-transparent mb-2">
                  Transação Concluída!
                </h2>
                <p className="text-gray-600 text-lg">
                  Seu saque foi processado com sucesso.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
