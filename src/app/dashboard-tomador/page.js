'use client';

// src/app/dashboard-tomador/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout, isBorrower } from '../utils/auth';
import Link from 'next/link';
import SidebarTomador from '../components/SidebarTomador';

export default function DashboardTomador() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado e é tomador
    const currentUser = getCurrentUser();
    if (!currentUser || !isBorrower()) {
      router.push('/entrar');
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarTomador user={user} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-brand-purple-dark">
              Olá, Tomador!
            </h1>
            <a href="/dashboard-tomador/solicitar-emprestimo">
              <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-5 py-2 rounded-full font-bold ml-4 shadow transition-all">
                Solicitar Empréstimo
              </button>
            </a>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
          {/* Top Cards */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Saldo Devedor */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm opacity-80 mb-2">Saldo devedor</h3>
                  <p className="text-3xl font-bold">R$ 7.000,00</p>
                </div>
              </div>
              
              {/* Gráfico simples */}
              <div className="flex items-end space-x-1 mb-4">
                <div className="w-2 bg-white/40 h-8"></div>
                <div className="w-2 bg-white/60 h-12"></div>
                <div className="w-2 bg-white/80 h-16"></div>
                <div className="w-2 bg-white h-10"></div>
              </div>
              <div className="text-xs opacity-60">jul ago set out</div>
              
              {/* Moedas decorativas */}
              <div className="absolute top-4 right-4 text-2xl opacity-30">
                💰💰💰
              </div>
            </div>

            {/* Próxima Parcela */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white">
              <h3 className="text-sm opacity-80 mb-2">Próxima parcela</h3>
              <p className="text-2xl font-bold mb-2">15 outubro</p>
              <p className="text-xl mb-4">R$ 200,00</p>
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold transition-colors">
                Pagar agora
              </button>
            </div>
          </div>

          {/* Parcelas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-4">
              Parcelas
            </h2>
            
            {/* Filtros */}
            <div className="flex space-x-2 mb-6">
              <button className="px-4 py-2 bg-brand-pink text-white rounded-full text-sm">
                Pagas
              </button>
              <button className="px-4 py-2 bg-brand-pink text-white rounded-full text-sm">
                Em aberto
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                Futuras parcelas
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                Atrasadas
              </button>
            </div>

            {/* Tabela de Parcelas */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-gray-600">Parcela</th>
                    <th className="text-left py-3 text-gray-600">Valor</th>
                    <th className="text-left py-3 text-gray-600">Vencimento</th>
                    <th className="text-left py-3 text-gray-600">Gerar boleto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">1</td>
                    <td className="py-3 text-brand-pink font-semibold">R$ 520,00</td>
                    <td className="py-3 text-brand-pink font-semibold">15 out</td>
                    <td className="py-3">
                      <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-4 py-2 rounded-full text-sm flex items-center space-x-1 transition-colors">
                        <span>📄</span>
                        <span>Gerar</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">2</td>
                    <td className="py-3 text-gray-800">R$ 150,00</td>
                    <td className="py-3 text-gray-800">26 set</td>
                    <td className="py-3">
                      <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-4 py-2 rounded-full text-sm flex items-center space-x-1 transition-colors">
                        <span>📄</span>
                        <span>Gerar</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">3</td>
                    <td className="py-3 text-gray-800">R$ 100,00</td>
                    <td className="py-3 text-gray-800">26 out</td>
                    <td className="py-3">
                      <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-4 py-2 rounded-full text-sm flex items-center space-x-1 transition-colors">
                        <span>📄</span>
                        <span>Gerar</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">4</td>
                    <td className="py-3 text-gray-800">R$ 300,00</td>
                    <td className="py-3 text-gray-800">12 dez</td>
                    <td className="py-3">
                      <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-4 py-2 rounded-full text-sm flex items-center space-x-1 transition-colors">
                        <span>📄</span>
                        <span>Gerar</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">5</td>
                    <td className="py-3 text-gray-800">R$ 500,00</td>
                    <td className="py-3 text-gray-800">16 nov</td>
                    <td className="py-3">
                      <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-4 py-2 rounded-full text-sm flex items-center space-x-1 transition-colors">
                        <span>📄</span>
                        <span>Gerar</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-4">
              Notificações
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">📄</div>
                <div className="flex-1">
                  <p className="text-gray-800">Parcela próxima em 2 dias</p>
                </div>
              </div>
            </div>
            
            <button className="mt-4 bg-brand-purple-light hover:bg-brand-purple-dark text-white px-6 py-3 rounded-full transition-colors">
              Ver todas
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
