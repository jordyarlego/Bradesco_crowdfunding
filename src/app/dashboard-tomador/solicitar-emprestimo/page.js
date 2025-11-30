"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SidebarTomador from "../../components/SidebarTomador";
import { AuthContext } from "../../utils/authContext";
import { emprestimoService } from "@/services/emprestimoService";

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
  const { usuario, token, loading, autenticado } = useContext(AuthContext);

  const [valor, setValor] = useState(1000);
  const [parcelas, setParcelas] = useState(12);
  const [valorParcela, setValorParcela] = useState(0);
  const [toast, setToast] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [verificandoEmprestimo, setVerificandoEmprestimo] = useState(true);
  const [temEmprestimoAtivo, setTemEmprestimoAtivo] = useState(false);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [erro, setErro] = useState(null);

  // Verificar se já tem empréstimo ativo
  useEffect(() => {
    const verificarEmprestimoAtivo = async () => {
      if (loading || !usuario || !autenticado) return;

      try {
        const emprestimos = await emprestimoService.listarEmprestimosPorTomador(
          usuario.id,
          token
        );

        // Verificar se existe algum empréstimo ativo (não finalizado ou cancelado)
        const emprestimoAtivo = emprestimos?.find(
          (emp) => {
            const status = emp.status?.toLowerCase();
            return (
              status === "ativo" ||
              status === "em_andamento" ||
              status === "pendente" ||
              status === "em andamento" ||
              (status !== "finalizado" && status !== "cancelado" && status !== "concluído")
            );
          }
        );

        setTemEmprestimoAtivo(!!emprestimoAtivo);
      } catch (error) {
        console.error("Erro ao verificar empréstimos:", error);
      } finally {
        setVerificandoEmprestimo(false);
      }
    };

    if (!loading && autenticado && usuario) {
      verificarEmprestimoAtivo();
    }
  }, [loading, autenticado, usuario, token]);

  useEffect(() => {
    if (loading) return;

    if (!autenticado) {
      router.push("/entrar");
      return;
    }

    const { valorParcela: vp } = calcularJuros(valor, parcelas);
    setValorParcela(vp);
  }, [loading, autenticado, usuario, valor, parcelas, router]);

  if (loading || !usuario || verificandoEmprestimo) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <div className="text-white text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  const handleSolicitarReal = async () => {
    if (valor < 1000) {
      setErro("O valor mínimo para solicitar um empréstimo é R$ 1.000,00. Por favor, ajuste o valor desejado.");
      return;
    }

    setEnviando(true);

    const { taxa, total, valorParcela: vp } = calcularJuros(valor, parcelas);

    const payload = {
      tomadorId: usuario.id,
      prazo: parcelas,
      montante: valor,
      juros: taxa,
      dataFim: new Date(Date.now() + parcelas * 30 * 24 * 60 * 60 * 1000),
    };

    try {
      const response = await emprestimoService.criarEmprestimo(payload, token);

      if (response?.error) {
        setErro(response.error || "Erro ao processar empréstimo");
        setEnviando(false);
        return;
      }

      // Mostrar feedback de sucesso
      setMostrarSucesso(true);
      
      setTimeout(() => {
        router.push("/dashboard-tomador/emprestimo-ativo");
      }, 3000);
    } catch (error) {
      setErro(error.message || "Erro ao solicitar empréstimo. Tente novamente mais tarde.");
      setEnviando(false);
    }
  };

  // Tela de erro
  if (erro) {
    return (
      <div className="min-h-screen bg-hero-gradient flex">
        <SidebarTomador usuario={usuario} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-red-500/30 shadow-2xl max-w-2xl w-full animate-scaleInBounce">
            <div className="text-center">
              <div className="mb-8 animate-scaleInBounce">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border-4 border-red-500/30 animate-float">
                  <svg
                    className="w-20 h-20 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-6 animate-fadeInUp">
                Erro ao Solicitar Empréstimo
              </h1>
              
              <div className="bg-red-500/10 rounded-2xl p-6 mb-8 border border-red-500/20 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
                <p className="text-white text-xl leading-relaxed">
                  {erro}
                </p>
              </div>

              <div className="flex gap-4 justify-center animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
                <button
                  onClick={() => {
                    setErro(null);
                    setEnviando(false);
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => router.push("/dashboard-tomador")}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 border border-white/30"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Tela de sucesso
  if (mostrarSucesso) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center animate-scaleInBounce">
          <div className="mb-8 animate-scaleInBounce">
            <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center animate-scaleInBounce">
              <svg
                className="w-16 h-16 text-green-500"
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
            <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInUp">
              Empréstimo feito com sucesso!
            </h2>
            <p className="text-white/80 text-lg animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              Seu empréstimo foi processado e está sendo analisado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Aviso de empréstimo ativo existente
  if (temEmprestimoAtivo) {
    return (
      <div className="min-h-screen bg-hero-gradient flex">
        <SidebarTomador usuario={usuario} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/30 shadow-2xl max-w-2xl w-full animate-scaleInBounce">
            <div className="text-center">
              <div className="mb-8 animate-scaleInBounce">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-brand-pink/20 to-brand-purple-dark/20 rounded-full flex items-center justify-center border-4 border-white/30 animate-float">
                  <svg
                    className="w-20 h-20 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-6 animate-fadeInUp">
                Empréstimo Ativo Encontrado
              </h1>
              
              <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
                <p className="text-white text-xl leading-relaxed">
                  Você já possui um empréstimo ativo em nosso sistema.
                </p>
                <p className="text-white/80 text-lg mt-4">
                  Por questões de segurança e controle financeiro, cada tomador pode ter apenas <strong className="text-white">1 empréstimo ativo</strong> por vez.
                </p>
              </div>

              <div className="flex justify-center animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
                <button
                  onClick={() => router.push("/dashboard-tomador")}
                  className="bg-gradient-to-r from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      <SidebarTomador usuario={usuario} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header com animação */}
          <div className="mb-12 animate-fadeInUp">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Solicitar Empréstimo
        </h1>
            <p className="text-white/70 text-lg">
              Preencha os dados abaixo para solicitar seu empréstimo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Formulário */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl animate-slideUp">
              <div className="space-y-6">
                <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
                  <label className="text-white font-semibold text-lg mb-3 block">
                    Valor desejado
                  </label>
          <input
            type="range"
            min="1000"
            max="50000"
            step="100"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
                    className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #D9266F 0%, #D9266F ${((valor - 1000) / (50000 - 1000)) * 100}%, rgba(255,255,255,0.2) ${((valor - 1000) / (50000 - 1000)) * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-white/60 text-sm mt-1">
                    <span>R$ 1.000</span>
                    <span>R$ 50.000</span>
                  </div>
                  <div className="text-white text-3xl font-bold mt-4 text-center bg-white/10 rounded-xl py-4 animate-scaleIn">
                    {formatarMoeda(valor)}
                  </div>
                </div>

                <div className="animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
                  <label className="text-white font-semibold text-lg mb-3 block">
                    Número de parcelas
          </label>
          <input
            type="range"
            min="6"
            max="48"
            step="1"
            value={parcelas}
            onChange={(e) => setParcelas(Number(e.target.value))}
                    className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #D9266F 0%, #D9266F ${((parcelas - 6) / (48 - 6)) * 100}%, rgba(255,255,255,0.2) ${((parcelas - 6) / (48 - 6)) * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-white/60 text-sm mt-1">
                    <span>6x</span>
                    <span>48x</span>
                  </div>
                  <div className="text-white text-3xl font-bold mt-4 text-center bg-white/10 rounded-xl py-4 animate-scaleIn">
                    {parcelas}x parcelas
                  </div>
                </div>

                {/* Resumo */}
                <div className="bg-gradient-to-br from-brand-pink/20 to-brand-purple-dark/20 rounded-2xl p-6 border border-white/20 mt-8 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
                  <h3 className="text-white font-bold text-lg mb-4">Resumo da Proposta</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Parcela estimada:</span>
                      <span className="text-white font-bold text-xl">
                        {formatarMoeda(valorParcela)}
                      </span>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total a pagar:</span>
                      <span className="text-white font-bold text-2xl text-brand-pink">
                        {formatarMoeda(calcularJuros(valor, parcelas).total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-white/60">Taxa de juros:</span>
                      <span className="text-white/80">
                        {(calcularJuros(valor, parcelas).taxa * 100).toFixed(1)}% a.m.
                      </span>
                    </div>
                  </div>
          </div>

                {/* Botão */}
          <button
            onClick={handleSolicitarReal}
            disabled={enviando}
                  className="w-full bg-gradient-to-r from-white to-white/90 text-brand-purple-dark font-bold py-5 px-8 rounded-full text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed animate-fadeInUp"
                  style={{ animationDelay: "0.4s" }}
                >
                  {enviando ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-brand-purple-dark border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </span>
                  ) : (
                    "Solicitar Empréstimo"
                  )}
          </button>
              </div>
            </div>

            {/* Imagem */}
            <div className="flex items-center justify-center animate-slideInRight">
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/30 to-brand-purple-dark/30 rounded-3xl blur-2xl animate-float"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                  <Image
                    src="/emprestimo.png"
                    alt="Empréstimo"
                    width={600}
                    height={600}
                    className="w-full h-auto rounded-2xl animate-fadeInScale"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast melhorado */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl text-white shadow-2xl z-50 animate-slideUp ${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #D9266F;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(217, 38, 111, 0.5);
          transition: all 0.3s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(217, 38, 111, 0.7);
        }

        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #D9266F;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(217, 38, 111, 0.5);
          transition: all 0.3s ease;
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(217, 38, 111, 0.7);
        }
      `}</style>
    </div>
  );
}
