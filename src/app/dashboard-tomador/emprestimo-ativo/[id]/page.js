"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import SidebarTomador from "../../../components/SidebarTomador";

import { AuthContext } from "../../../utils/authContext";
import { emprestimoService } from "../../../../services/emprestimoService";
import { pagamentoService } from "../../../../services/pagamentoService";

export default function EmprestimoAtivo() {
  const router = useRouter();
  const { id: emprestimoId } = useParams();

  const { usuario, autenticado, loading } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [emprestimo, setEmprestimo] = useState(null);
  const [parcelas, setParcelas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("todas");

  const [toast, setToast] = useState(null);

  // ======================================================
  // 🔐 Autenticação inicial (MESMO PADRÃO de solicitar-emprestimo)
  // ======================================================
  useEffect(() => {
    if (!loading) {
      if (!autenticado) {
        router.push("/entrar");
        return;
      }

      carregarDados();
    }
  }, [loading, autenticado, usuario, emprestimoId]);

  // ======================================================
  // 📌 Carregar empréstimo + parcelas
  // ======================================================
  const carregarDados = async () => {
    const token = localStorage.getItem("authToken");

    try {
      setIsLoading(true);

      const emp = await emprestimoService.buscarEmprestimoPorId(
        emprestimoId,
        token
      );
      setEmprestimo(emp);

      const pags = await pagamentoService.listarPagamentosPorEmprestimo(
        emprestimoId,
        token
      );
      setParcelas(formatarPagamentos(pags));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);

      setToast({
        type: "error",
        message: error.message || "Erro ao carregar este empréstimo.",
      });

      if (error.message?.includes("401") || error.message?.includes("Token")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/entrar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // 📌 Tratamento de parcelas
  // ======================================================
  const formatarPagamentos = (lista) => {
    return lista.map((p) => ({
      id: p.id,
      numero: p.numeroParcela,
      valor: p.valor,
      vencimento: new Date(p.dataVencimento).toLocaleDateString("pt-BR"),
      status: p.status,
    }));
  };

  // ======================================================
  // 📌 Utilidades
  // ======================================================
  const formatarMoeda = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  const getStatusBadge = (status) => {
    const classes = {
      paga: "bg-green-100 text-green-700",
      em_aberto: "bg-yellow-100 text-yellow-700",
      atrasada: "bg-red-100 text-red-700",
      futura: "bg-blue-100 text-blue-700",
    };
    return classes[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) =>
    ({
      paga: "pago",
      em_aberto: "em aberto",
      atrasada: "em atraso",
      futura: "Futura",
    }[status] || status);

  const parcelasFiltradas =
    filtroStatus === "todas"
      ? parcelas
      : parcelas.filter((p) => p.status === filtroStatus);

  const handleGerarBoleto = (parcela) => {
    setToast({
      message: `Boleto da parcela ${parcela.numero} gerado! (Simulação)`,
      type: "success",
    });
    setTimeout(() => setToast(null), 4000);
  };

  // ======================================================
  // ⏳ Loading
  // ======================================================
  if (loading || isLoading || !emprestimo) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <p className="text-white text-xl">Carregando dados...</p>
      </div>
    );
  }

  // ======================================================
  // 📌 Layout
  // ======================================================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarTomador user={usuario} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard-tomador")}
              className="text-gray-600 hover:text-brand-pink transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-brand-purple-dark">
              Empréstimo #{emprestimo.codigoTransacao}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-8">
          {/* Resumo superior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm opacity-80 mb-2">Montante</h3>
              <p className="text-3xl font-bold">
                {formatarMoeda(emprestimo.montante)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-brand-pink to-brand-purple-dark rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm opacity-80 mb-2">Saldo Devedor</h3>
              <p className="text-3xl font-bold">
                {formatarMoeda(emprestimo.saldoDevedor)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm opacity-80 mb-2">Taxa de Juros</h3>
              <p className="text-3xl font-bold">{emprestimo.juros}% a.m.</p>
            </div>
          </div>

          {/* Dados gerais */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-6">
              Informações do Empréstimo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Data Início</p>
                <p className="text-lg font-bold text-brand-purple-dark">
                  {new Date(emprestimo.dataInicio).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Data Fim</p>
                <p className="text-lg font-bold text-brand-purple-dark">
                  {new Date(emprestimo.dataFim).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                  {emprestimo.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600">Total de Parcelas</p>
                <p className="text-lg font-bold text-brand-purple-dark">
                  {emprestimo?.pagamentos.length}x
                </p>
              </div>
            </div>
          </div>

          {/* Lista de parcelas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-purple-dark">
                Parcelas
              </h2>

              <div className="flex gap-2 flex-wrap">
                {["todas", "pago", "em aberto", "em atraso", "futura"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setFiltroStatus(st)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        filtroStatus === st
                          ? "bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {st === "todas" ? "Todas" : getStatusLabel(st)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              {parcelasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma parcela encontrada.
                </div>
              ) : (
                parcelasFiltradas.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white rounded-full flex items-center justify-center font-bold">
                        {parcelasFiltradas.indexOf(p) + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-black">
                            Parcela {parcelasFiltradas.indexOf(p) + 1}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              p.status
                            )}`}
                          >
                            {getStatusLabel(p.status)}
                          </span>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>
                            <strong>Valor:</strong> {formatarMoeda(p.valor)}
                          </span>
                          <span>
                            <strong>Vencimento:</strong> {p.vencimento}
                          </span>
                        </div>
                      </div>
                    </div>

                    {p.status !== "paga" && (
                      <button
                        onClick={() => handleGerarBoleto(p)}
                        className="px-6 py-2 bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white rounded-lg font-semibold shadow-lg hover:scale-105 transition"
                      >
                        Gerar Boleto
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`rounded-xl p-4 shadow-2xl text-white flex gap-4 ${
              toast.type === "error"
                ? "bg-red-500"
                : "bg-gradient-to-r from-brand-pink to-brand-purple-dark"
            }`}
          >
            <span className="font-semibold">{toast.message}</span>
            <button onClick={() => setToast(null)}>✖</button>
          </div>
        </div>
      )}
    </div>
  );
}
