'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../utils/authContext'; 
import SidebarInvestidor from '../components/SidebarInvestidor';
import { investimentoService } from '@/services/investimentoService';

export default function DashboardInvestidor() {
  const router = useRouter();

  const {
    usuario,
    autenticado,
    loading,
    isInvestor,
    logout
  } = useContext(AuthContext);

  const [saldoDisponivel, setSaldoDisponivel] = useState(5000);
  const [investimentosAtivos, setInvestimentosAtivos] = useState([]);
  const [isLoadingInvestimentos, setIsLoadingInvestimentos] = useState(true);
  const [toast, setToast] = useState(null);

  // ============================
  // 1. Proteção da página
  // ============================
  useEffect(() => {
    if (loading) return;

    console.log("🔐 DashboardInvestidor - auth:", {
      autenticado,
      role: usuario?.role
    });

    if (!autenticado || !isInvestor()) {
      router.push('/entrar');
      return;
    }
  }, [loading, autenticado, usuario, isInvestor, router]);

  // ============================
  // 2. Buscar investimentos
  // ============================
  useEffect(() => {
    if (!autenticado || !usuario) return;

    const fetchInvestimentos = async () => {
      try {
        setIsLoadingInvestimentos(true);

        const response = await investimentoService.listarInvestimentos();
        console.log("📊 Investimentos carregados:", response);

        setInvestimentosAtivos(Array.isArray(response) ? response : []);

      } catch (error) {
        console.error("❌ Erro ao buscar investimentos:", error);

        setToast({
          type: "error",
          message: error.message || "Erro ao carregar investimentos."
        });

        // Tratamento padronizado de token inválido
        if (String(error.message).includes("401") || String(error.message).includes("403")) {
          await logout();
        }

      } finally {
        setIsLoadingInvestimentos(false);
      }
    };

    fetchInvestimentos();
  }, [autenticado, usuario, logout]);

  // ============================
  // Helpers
  // ============================
  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);

  // ============================
  // Tela carregando
  // ============================
  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // ============================
  // Renderização principal
  // ============================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarInvestidor user={usuario} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Olá, {usuario?.nome || 'Investidor'}!
          </h1>
        </header>

        <main className="flex-1 p-8">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Investimentos Ativos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-6">
              Investimentos ativos
            </h2>

            {isLoadingInvestimentos ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple-dark"></div>
                <span className="ml-2">Carregando investimentos...</span>
              </div>
            ) : investimentosAtivos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Você ainda não possui investimentos.</p>
                <button
                  onClick={() =>
                    router.push('/dashboard-investidor/pool-de-investimentos')
                  }
                  className="mt-4 bg-brand-purple-dark text-white px-6 py-2 rounded-lg hover:bg-brand-purple-light transition-colors"
                >
                  Explorar Investimentos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investimentosAtivos.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <h3 className="font-bold text-lg text-brand-purple-dark">
                      {inv.nome}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2">{inv.descricao}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa:</span>
                        <span className="font-semibold text-green-600">
                          {inv.taxaJuros}% a.m.
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Prazo:</span>
                        <span>{inv.prazoMeses} meses</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Mínimo:</span>
                        <span>{formatarMoeda(inv.valorMinimo)}</span>
                      </div>

                      <div className="flex justify-between text-sm font-bold">
                        <span>Valor Atual:</span>
                        <span className="text-brand-purple-dark">
                          {formatarMoeda(inv.valorAtual)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
