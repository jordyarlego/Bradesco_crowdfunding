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

  useEffect(() => {
    console.log("Page solicitar-emprestimo");
    console.log(loading);
    console.log(autenticado);
    console.log(usuario?.tipo);
    if (loading) return;

    if (!autenticado) {
      router.push("/entrar");
      return;
    }

    const { valorParcela: vp } = calcularJuros(valor, parcelas);
    setValorParcela(vp);
  }, [loading, autenticado, usuario, valor, parcelas, router]);

  if (loading || !usuario) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
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
      setToast({ message: "O valor mínimo é R$ 1.000", type: "error" });
      setTimeout(() => setToast(null), 3000);
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
    console.log("Enviando payload:", payload);

    try {
      const response = await emprestimoService.criarEmprestimo(payload, token);

      if (response?.error) {
        setToast({ message: response.error, type: "error" });
        setEnviando(false);
        return;
      }

      setToast({
        message: "Empréstimo solicitado com sucesso!",
        type: "success",
      });

      setTimeout(
        () => router.push("/dashboard-tomador/emprestimo-ativo"),
        1800
      );
    } catch (error) {
      setToast({ message: "Erro ao solicitar empréstimo", type: "error" });
    }

    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      <SidebarTomador usuario={usuario} />

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          Solicitar Empréstimo
        </h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-xl">
          <label className="text-white font-semibold">Valor desejado</label>
          <input
            type="range"
            min="1000"
            max="50000"
            step="100"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className="w-full mt-2"
          />

          <div className="text-white text-lg mb-6">{formatarMoeda(valor)}</div>

          <label className="text-white font-semibold">
            Número de parcelas ({parcelas})
          </label>
          <input
            type="range"
            min="6"
            max="48"
            step="1"
            value={parcelas}
            onChange={(e) => setParcelas(Number(e.target.value))}
            className="w-full mt-2"
          />

          <div className="mt-6 text-white space-y-2">
            <p>
              🧮 Parcela estimada: <b>{formatarMoeda(valorParcela)}</b>
            </p>
            <p>
              Total a pagar:{" "}
              <b>{formatarMoeda(calcularJuros(valor, parcelas).total)}</b>
            </p>
          </div>

          <button
            onClick={handleSolicitarReal}
            disabled={enviando}
            className="mt-8 w-full bg-white text-brand-purple-dark font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-all"
          >
            {enviando ? "Enviando..." : "Solicitar Empréstimo"}
          </button>
        </div>

        {toast && (
          <div
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}
