"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../utils/authContext";
import SidebarInvestidor from "../components/SidebarInvestidor";
import { investimentoService } from "@/services/investimentoService";
import { aplicacaoService } from "@/services/aplicacaoService";
import { usuarioService } from "@/services/usuarioService";

export default function DashboardInvestidor() {
  const router = useRouter();

  const { usuario, autenticado, loading, isInvestor, logout } =
    useContext(AuthContext);

  const [saldoDisponivel, setSaldoDisponivel] = useState();
  const [aplicacoesAtivas, setAplicacoesAtivas] = useState([]); // Mudar para aplicações
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!autenticado || !isInvestor()) {
        router.push("/entrar");
        return;
      }
      ;
      carregarDados();
    }
  }, [loading, autenticado, usuario]);

  const carregarDados = async () => {
    const token = localStorage.getItem("authToken");

    try {      
      setIsLoading(true);

      const usuarioDados = await usuarioService.buscarPorId(usuario?.id)

      setSaldoDisponivel(usuarioDados?.saldo)

      console.log("dados", usuarioDados);

      const aplicacoes = await aplicacaoService.listarPorUsuario(
        usuario?.id,
        token
      );
      
      console.log("📋 Lista completa de aplicações:", aplicacoes);
      
      
      const aplicacoesProcessadas = Array.isArray(aplicacoes) 
        ? aplicacoes.map(aplicacao => ({
            ...aplicacao,
            investimento: aplicacao.investimento,
           
            valorAplicado: parseFloat(aplicacao.valor),
            dataFormatada: new Date(aplicacao.dataCriacao).toLocaleDateString('pt-BR'),
          }))
        : [];

      ;
      
      // ✅ Para debug
      if (aplicacoesProcessadas.length > 0) {
        aplicacoesProcessadas.forEach((aplicacao, index) => {
          console.log(`📊 Aplicação ${index + 1}:`, {
            valorInvestido: aplicacao.valor,
            investimentoNome: aplicacao.investimento?.nome,
            totalInvestimento: aplicacao.investimento?.valor
          });
        });
      }

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
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numero || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarInvestidor user={usuario} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Olá, {usuario?.nome || "Investidor"}!
          </h1>
          <div className="text-right">
            <p className="text-gray-600">Saldo disponível</p>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(saldoDisponivel)}
            </p>
          </div>
        </header>

        <main className="flex-1 p-8">
          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                toast.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Investimentos Ativos */}
          <div className="bg-white rounded-2xl p )}6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand-purple-dark">
                Investimentos ativos
              </h2>
              <p className="text-gray-600">
                Total investido:{" "}
                <span className="font-bold text-brand-purple-dark">
                  {formatarMoeda(
                    aplicacoesAtivas.reduce((total, aplicacao) => 
                      total + (parseFloat(aplicacao.valor) || 0), 0
                    )
                  )}
                </span>
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple-dark"></div>
                <span className="ml-2">Carregando investimentos...</span>
              </div>
            ) : aplicacoesAtivas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  Você ainda não possui investimentos.
                </p>
                <button
                  onClick={() =>
                    router.push("/dashboard-investidor/pool-de-investimentos")
                  }
                  className="mt-4 bg-brand-purple-dark text-white px-6 py-2 rounded-lg hover:bg-brand-purple-light transition-colors"
                >
                  Explorar Investimentos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aplicacoesAtivas.map((aplicacao) => {
                  const investimento = aplicacao.investimento;
                  
                  return (
                    <div
                      key={aplicacao.id}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
                    >
                      {/* Cabeçalho com nome e data */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-brand-purple-dark">
                          {investimento?.nome || "Investimento"}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {aplicacao.dataFormatada}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {investimento?.descricao || "Sem descrição"}
                      </p>

                      <div className="space-y-2 mb-3">
                        {/* VALOR APLICADO PELO USUÁRIO */}
                        <div className="flex justify-between items-center bg-purple-50 p-2 rounded">
                          <span className="text-sm text-purple-800 font-semibold">
                            Seu investimento:
                          </span>
                          <span className="text-lg font-bold text-brand-purple-dark">
                            {formatarMoeda(aplicacao.valor)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Taxa:</span>
                          <span className="font-semibold text-green-600">
                            {investimento?.juros}% a.m.
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Prazo:</span>
                          <span>{investimento?.prazo} meses</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Mínimo:</span>
                          <span>{formatarMoeda(investimento?.valorMinimo)}</span>
                        </div>

                        {/* VALOR TOTAL DO INVESTIMENTO (opcional) */}
                        <div className="flex justify-between text-sm text-gray-500 border-t pt-2 mt-2">
                          <span>Total do investimento:</span>
                          <span>{formatarMoeda(investimento?.valor)}</span>
                        </div>

                        {/* Progresso do investimento */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progresso:</span>
                            <span>
                              {Math.round((investimento?.totalInvestido / investimento?.valor) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div 
                              className="bg-gradient-to-r from-brand-purple-light to-brand-purple-dark h-2 rounded-full"
                              style={{ 
                                width: `${Math.min(100, (investimento?.totalInvestido / investimento?.valor) * 100)}%` 
                              }}
                            />
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
    </div>
  );
}