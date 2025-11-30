'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import SidebarTomador from '../../components/SidebarTomador';
import { AuthContext } from '../../utils/authContext';
import { emprestimoService } from '../../services/emprestimoService';

// ======================================================
// FUNÇÃO DE JUROS (mantive sua lógica original)
// ======================================================
function calcularJuros(valor, parcelas) {
  let taxa = 0.02;
  if (parcelas > 12) taxa = 0.015;
  if (parcelas > 24) taxa = 0.01;

  const valorTotal = valor * (1 + taxa * parcelas);
  return { taxa, valorTotal };
}

export default function SolicitarEmprestimo() {
  const router = useRouter();
  const { usuario, autenticado, loading, isBorrower } = useContext(AuthContext);

  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState(12);
  const [resultado, setResultado] = useState(null);
  const [loadingEnvio, setLoadingEnvio] = useState(false);

  // ======================================================
  // PROTEÇÃO DE ROTA 100% ESTÁVEL
  // ======================================================
  useEffect(() => {
    console.log("solicitar-emprestimo.js")
    console.log(loading)
    console.log(autenticado)
    console.log(isBorrower)
    if (loading) return; // ainda carregando o contexto → não redirecionar

    // Usuário não autenticado
    if (!autenticado) {
      console.log('Usuário não autenticado → redirecionando para /entrar');
      router.push('/entrar');
      return;
    }
   
    

  }, [loading, autenticado, isBorrower, router]);

  if (loading) {
    return <p>Carregando autenticação...</p>;
  }

  // ======================================================
  // SIMULAÇÃO DO EMPRÉSTIMO
  // ======================================================
  function simular() {
    if (!valor || valor <= 0) return;
    const r = calcularJuros(Number(valor), Number(parcelas));
    setResultado(r);
  }

  // ======================================================
  // ENVIO REAL PARA API COM TOKEN CORRETO
  // ======================================================
  async function solicitarEmprestimo() {
    try {
      setLoadingEnvio(true);

      const token = localStorage.getItem('authToken');
      

      const payload = {
        tomadorId: usuario.id,
        valor: Number(valor),
        parcelas: Number(parcelas),
        taxa: resultado.taxa,
        valorTotal: resultado.valorTotal
      };

      console.log("Enviando payload:", payload);

      await emprestimoService.criarEmprestimo(payload, token);

      alert('Empréstimo solicitado com sucesso!');
      router.push('/dashboard-tomador');

    } catch (error) {
      console.error("Erro ao solicitar empréstimo:", error);
      alert("Erro ao solicitar empréstimo.");
    } finally {
      setLoadingEnvio(false);
    }
  }

  return (
    <div className="flex">
      <SidebarTomador user={usuario} />

      <div className="flex-1 p-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Solicitar Empréstimo</h1>

        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded-xl shadow">
          <label className="font-medium">Valor desejado:</label>
          <input
            type="number"
            className="w-full p-2 border rounded mb-4"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <label className="font-medium">Parcelas:</label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
          >
            {[6, 12, 18, 24, 36, 48].map((p) => (
              <option key={p} value={p}>{p}x</option>
            ))}
          </select>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
            onClick={simular}
          >
            Simular
          </button>
        </div>

        {/* RESULTADO */}
        {resultado && (
          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">Resultado:</h2>

            <p>Taxa mensal: <b>{(resultado.taxa * 100).toFixed(2)}%</b></p>
            <p>Valor total: <b>R${resultado.valorTotal.toFixed(2)}</b></p>

            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow"
              onClick={solicitarEmprestimo}
              disabled={loadingEnvio}
            >
              {loadingEnvio ? "Enviando..." : "Solicitar Empréstimo"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
