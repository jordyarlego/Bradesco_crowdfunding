"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";

// CORREÇÃO: Usar AuthContext em vez de funções diretas
import { AuthContext } from "../../utils/authContext";

// CORREÇÃO: Importar serviços com caminhos corretos
import { investimentoService } from "../../../services/investimentoService";
import { aplicacaoService } from "../../../services/aplicacaoService";

import SidebarInvestidor from "../../components/SidebarInvestidor";

export default function PoolDeInvestimentos() {
  const router = useRouter();

  // CORREÇÃO: Usar contexto em vez de estado local
  const {
    usuario,
    autenticado,
    loading: authLoading,
    isInvestor,
  } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [investimentos, setInvestimentos] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvestimento, setSelectedInvestimento] = useState(null);
  const [valorInvestimento, setValorInvestimento] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [showQRCode, setShowQRCode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [toast, setToast] = useState(null);

  // ----------------------------
  //   VALIDAÇÕES DE LOGIN - CORRIGIDO
  // ----------------------------
  useEffect(() => {
    console.log("PoolInvestimentos - Estado auth:", {
      autenticado,
      authLoading,
      usuario,
      isInvestor: isInvestor(),
    });

    if (!authLoading) {
      if (!autenticado || !isInvestor()) {
        console.log("PoolInvestimentos - Redirecionando para login");
        router.push("/entrar");
        return;
      }

      console.log("PoolInvestimentos - Usuário autenticado como investidor");
      fetchInvestimentos();
    }
  }, [autenticado, authLoading, isInvestor, router, usuario]);

  // ----------------------------
  //   BUSCA INVESTIMENTOS
  // ----------------------------
  const fetchInvestimentos = async () => {
    try {
      console.log("Buscando investimentos...");
      const data = await investimentoService.listarInvestimentos(usuario.token);
      console.log("Investimentos recebidos:", data);
      setInvestimentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar investimentos:", error);
      showToast("Erro ao carregar investimentos.", "error");

      // Se for erro de autenticação, redireciona
      if (
        error.message.includes("Token") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/entrar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------
  //  FUNÇÕES AUXILIARES
  // ----------------------------
  const calcularPercentual = (arrecadado, total) => {
    if (!total || total === 0) return 0;
    return ((arrecadado / total) * 100).toFixed(1);
  };

  const formatarMoeda = (valor) => {
    if (!valor) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ----------------------------
  //  MODAL & APLICAÇÃO - CORRIGIDO
  // ----------------------------
  const handleInvestirClick = (investimento) => {
    setSelectedInvestimento(investimento);
    setValorInvestimento(investimento.valorMinimo || 0);
    setIsModalOpen(true);
  };

  const handleConfirmar = async () => {
    if (!selectedInvestimento || !usuario) {
      showToast("Erro: dados incompletos para investimento.");
      return;
    }

    const valor = valorInvestimento;
    const min = selectedInvestimento.valorMinimo || 0;
    const max =
      selectedInvestimento.valor -
      (selectedInvestimento.totalInvestido || 0);

    // Validação do valor
    if (valor < min) {
      showToast(`O valor mínimo é ${formatarMoeda(min)}`);
      return;
    }

    if (valor > max) {
      showToast(`O valor máximo disponível é ${formatarMoeda(max)}`);
      return;
    }

    try {
      console.log("Enviando aplicação:", {
        investimentoId: selectedInvestimento.id,
        usuarioId: usuario.id,
        valor: valor
      });

     
      const resultado = await aplicacaoService.aplicar(
        usuario.id,                    // usuarioId (vai no body)
        selectedInvestimento.id,      // investimentoId (vai como param na URL)
        valor                         // valor (vai no body)        
      );

      console.log("Aplicação realizada com sucesso:", resultado);

      setShowQRCode(true);

      // animação
      setTimeout(() => {
        setShowQRCode(false);
        setShowSuccess(true);

        setTimeout(() => {
          setIsModalOpen(false);
          setShowSuccess(false);
          fetchInvestimentos(); // atualiza os valores
          showToast("Investimento realizado com sucesso!", "success");
        }, 2500);
      }, 2500);

    } catch (error) {
      console.error("Erro na aplicação:", error);
      
      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao realizar aplicação.";
      
      if (error.message.includes("401") || error.message.includes("Token")) {
        errorMessage = "Sessão expirada. Faça login novamente.";
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/entrar");
      } else if (error.message.includes("400")) {
        errorMessage = "Dados inválidos para o investimento.";
      } else if (error.message.includes("500")) {
        errorMessage = "Erro interno do servidor. Tente novamente.";
      }
      
      showToast(errorMessage);
    }
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
    setValorInvestimento(parseFloat(e.target.value) || 0);
  };

  const getSliderPercentage = () => {
    if (!selectedInvestimento) return 0;

    const min = selectedInvestimento.valorMinimo || 0;
    const max =
      selectedInvestimento.valor -
      (selectedInvestimento.totalInvestido || 0);

    if (max <= min) return 100;
    return ((valorInvestimento - min) / (max - min)) * 100;
  };

  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  
  if (!autenticado || !isInvestor()) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Redirecionando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <SidebarInvestidor user={usuario} />

      
      <div className="flex-1 flex flex-col">
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Pool de Investimentos
          </h1>
          <input
            type="text"
            placeholder="Buscar investimentos..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full"
          />
        </header>

        <main className="flex-1 p-8">
          {/* Toast Notification */}
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

          {investimentos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                Nenhum investimento disponível no momento.
              </p>
              <button
                onClick={fetchInvestimentos}
                className="bg-brand-purple-dark text-white px-6 py-2 rounded-lg hover:bg-brand-purple-light transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investimentos.map((investimento) => {
                const perc = calcularPercentual(
                  investimento.totalInvestido,
                  investimento.valor
                );

                return (
                  <div
                    key={investimento.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-bold text-brand-purple-dark mb-2">
                      {investimento.nome || "Investimento Sem Nome"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Tomador: {investimento.tomador?.nome || "Não informado"}
                    </p>

                    <div className="my-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-green-600 font-semibold">
                          {formatarMoeda(investimento.valor)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Arrecadado:</span>
                        <span className="text-green-600 font-semibold">
                          {formatarMoeda(investimento.totalInvestido)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mínimo:</span>
                        <span>{formatarMoeda(investimento.valorMinimo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Juros:</span>
                        <span className="text-green-600 font-semibold">
                          {investimento.juros}% a.m.
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prazo:</span>
                        <span className="text-green-600 font-semibold">{investimento?.prazo} meses</span>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                        <div
                          className="bg-gradient-to-r from-brand-pink to-brand-purple-dark h-2 rounded-full transition-all duration-300"
                          style={{ width: `${perc}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        {formatarMoeda(investimento.totalInvestido)} de{" "}
                        {formatarMoeda(investimento.valor)} ({perc}%)
                      </p>
                    </div>

                    <button
                      className="w-full bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white rounded-full py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleInvestirClick(investimento)}
                      disabled={investimento.totalInvestido >= investimento.valor}
                    >
                      {investimento.totalInvestido >= investimento.valor 
                        ? "Investimento Concluído" 
                        : "Investir Agora"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE INVESTIMENTO */}
      {isModalOpen && selectedInvestimento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">
                Investir em {selectedInvestimento.nome}
              </h3>

              {/* Informações do investimento */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Valor total:</span>
                  <span className="font-semibold">
                    {formatarMoeda(selectedInvestimento.valor)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Já investido:</span>
                  <span className="text-green-600">
                    {formatarMoeda(selectedInvestimento.totalInvestido)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Disponível:</span>
                  <span className="text-brand-purple-dark font-semibold">
                    {formatarMoeda(
                      selectedInvestimento.valor - 
                      (selectedInvestimento.totalInvestido || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Slider ou input de valor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Investimento: {formatarMoeda(valorInvestimento)}
                </label>
                <input
                  type="range"
                  min={selectedInvestimento.valorMinimo || 0}
                  max={
                    selectedInvestimento.valor -
                    (selectedInvestimento.totalInvestido || 0)
                  }
                  step="100"
                  value={valorInvestimento}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {formatarMoeda(selectedInvestimento.valorMinimo || 0)}
                  </span>
                  <span>
                    {formatarMoeda(
                      selectedInvestimento.valor -
                        (selectedInvestimento.totalInvestido || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Estados do modal */}
              {showQRCode && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700">Processando pagamento...</p>
                </div>
              )}

              {showSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700">Investimento realizado com sucesso!</p>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  disabled={showQRCode || showSuccess}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmar}
                  className="flex-1 bg-brand-pink text-white py-3 rounded-lg font-semibold hover:bg-brand-pink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={showQRCode || showSuccess}
                >
                  {showQRCode ? "Processando..." : 
                   showSuccess ? "Concluído!" : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}