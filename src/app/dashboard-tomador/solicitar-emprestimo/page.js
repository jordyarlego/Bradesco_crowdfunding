"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SidebarTomador from "../../components/SidebarTomador";
import { getCurrentUser } from "../../utils/auth";

function calcularJuros(valor, parcelas) {
  let taxa = 0.02;
  if (parcelas > 12 && parcelas <= 24) taxa = 0.025;
  else if (parcelas > 24 && parcelas <= 36) taxa = 0.03;
  else if (parcelas > 36) taxa = 0.035;
  const valorParcela = (valor * Math.pow(1 + taxa, parcelas)) / parcelas;
  const total = valorParcela * parcelas;
  return { taxa, valorParcela, total };
}

export default function Page() {
  const [valor, setValor] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [parcelas, setParcelas] = useState(12);
  const [valorParcela, setValorParcela] = useState(0);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleContinuar = () => {
    const { valorParcela } = calcularJuros(valor, parcelas);
    setValorParcela(valorParcela);
    setShowModal(true);
  };

  const handleParcelasChange = (e) => {
    const novoParcelas = Number(e.target.value);
    setParcelas(novoParcelas);
    const { valorParcela } = calcularJuros(valor, novoParcelas);
    setValorParcela(valorParcela);
  };

  const handleValorParcelaChange = (e) => {
    const novaParcela = Number(e.target.value);
    setValorParcela(novaParcela);
    let n = 6;
    for (let i = 6; i <= 48; i++) {
      const { valorParcela: vp } = calcularJuros(valor, i);
      if (vp <= novaParcela) {
        n = i;
        break;
      }
    }
    setParcelas(n);
  };

  const { taxa, total } = calcularJuros(valor, parcelas);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarTomador user={user} />
      <div className="flex-1 flex flex-row items-center justify-center gap-10">
        {/* Card à esquerda */}
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-[0_8px_40px_0_rgba(236,72,153,0.25)] p-16 w-[720px] flex flex-col items-center z-10 relative transition-all duration-300 hover:shadow-[0_12px_60px_0_rgba(236,72,153,0.35)] border-none ring-1 ring-white/30">
          <h1 className="text-3xl font-bold text-brand-pink mb-6 flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={36} height={36} /> Empréstimo
          </h1>
          <label className="font-semibold text-brand-purple-dark mb-1">Valor do empréstimo</label>
          <div className="text-3xl font-bold text-gray-500 mb-4">R$ {valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
          <input
            type="range"
            min={0}
            max={50000}
            step={100}
            value={valor}
            onChange={e => setValor(Number(e.target.value))}
            className="w-full accent-brand-pink mb-2"
          />
          <div className="w-full flex justify-between text-xs text-gray-500 mb-6">
            <span>R$ 00,00</span>
            <span>R$ 50.000,00</span>
          </div>
          <button
            className="w-full bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white font-bold py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            disabled={valor < 1000}
            onClick={handleContinuar}
          >
            <Image src="/logo.png" alt="Logo" width={28} height={28} /> Solicitar Empréstimo
          </button>
          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-10 w-[420px] flex flex-col items-center relative">
                <button className="absolute top-2 right-4 text-2xl" onClick={() => setShowModal(false)}>×</button>
                <h2 className="text-2xl font-bold text-brand-pink mb-4">Simule seu empréstimo</h2>
                <label className="block font-semibold mb-2">Parcelas: <span className="text-brand-pink">{parcelas}x</span></label>
                <input
                  type="range"
                  min={6}
                  max={48}
                  value={parcelas}
                  onChange={handleParcelasChange}
                  className="w-full mb-2 accent-brand-pink"
                />
                <div className="mb-4 text-gray-700">Juros: <b>{(taxa*100).toFixed(2)}%/mês</b></div>
                <label className="block font-semibold mb-2">Valor da parcela</label>
                <input
                  type="range"
                  min={Math.ceil(calcularJuros(valor, 48).valorParcela)}
                  max={Math.floor(calcularJuros(valor, 6).valorParcela)}
                  value={Math.round(valorParcela)}
                  onChange={handleValorParcelaChange}
                  className="w-full mb-2 accent-brand-pink"
                />
                <div className="mb-4 text-gray-700">R$ {valorParcela.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                <div className="mb-4 font-semibold text-brand-purple-dark">Total a pagar: <span className="text-brand-pink">R$ {total.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
                <button
                  className="w-full bg-gradient-to-r from-brand-pink to-brand-purple-dark text-white font-bold py-3 rounded-full text-lg mt-2 hover:scale-105 hover:shadow-lg transition"
                  onClick={() => setShowModal(false)}
                >
                  Solicitar agora
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Imagem à direita */}
        <div className="flex flex-col items-center justify-center">
          <Image src="/emprestimo.png" alt="Empréstimo" width={480} height={600} className="object-contain rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_60px_0_rgba(236,72,153,0.25)]" />
        </div>
      </div>
    </div>
  );
}
