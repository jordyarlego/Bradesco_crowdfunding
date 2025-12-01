'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../utils/authContext';
import SidebarTomador from '../components/SidebarTomador';
import { emprestimoService } from '@/services/emprestimoService';

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

    console.log("Dashboard Tomador — validação:", {
      autenticado,
      roleCheck: isBorrower(),
      usuario
    });

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

        console.log("Empréstimos carregados:", response);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const formatarMoeda = (v) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarTomador user={usuario} />

      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Olá, {usuario?.nome}!
          </h1>

          <button
            onClick={() => router.push('/dashboard-tomador/solicitar-emprestimo')}
            className="bg-brand-pink hover:bg-brand-pink-light text-white px-5 py-2 rounded-full font-bold ml-4 shadow transition-all"
          >
            Solicitar Empréstimo
          </button>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-8">

          {/* Toast */}
          {toast && (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
            }`}>
              {toast.message}
            </div>
          )}

          {/* CARD — Empréstimos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-6">
              Seus Empréstimos
            </h2>

            {isLoadingEmprestimos ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple-dark"></div>
                <span className="ml-2">Carregando empréstimos...</span>
              </div>
            ) : emprestimos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  Você ainda não possui empréstimos.
                </p>

                <button
                  className="mt-4 bg-brand-pink text-white px-6 py-2 rounded-lg hover:bg-brand-pink-light transition-colors"
                  onClick={() => router.push('/dashboard-tomador/solicitar-emprestimo')}
                >
                  Solicitar Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {emprestimos.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <h3 className="font-bold text-lg text-brand-purple-dark">
                      Empréstimo #{emp.codigoTransacao}
                    </h3>

                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Valor solicitado:</span>
                        <span className="font-semibold text-brand-pink">
                          {formatarMoeda(emp.montante)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Saldo devedor:</span>
                        <span className="font-semibold text-brand-pink">
                          {formatarMoeda(emp.saldoDevedor)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Taxa:</span>
                        <span span className="font-semibold text-brand-pink">{emp.juros}% a.m.</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Parcelas:</span>
                        <span className="font-semibold text-brand-pink">{emp.prazo}</span>
                      </div>

                      <button
                        className="mt-4 w-full bg-brand-purple-dark hover:bg-brand-purple-light text-white py-2 rounded-lg transition-colors"
                        onClick={() =>
                          router.push(`/dashboard-tomador/emprestimo-ativo/${emp.id.toString()}`)
                        }
                      >
                        Ver Detalhes
                      </button>
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
