'use client';

// src/app/dashboard-investidor/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout, isInvestor } from '../utils/auth';

export default function DashboardInvestidor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado e é investidor
    const currentUser = getCurrentUser();
    if (!currentUser || !isInvestor()) {
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
      {/* Sidebar */}
      <div className="w-20 bg-gradient-to-b from-brand-purple-light to-brand-purple-dark flex flex-col items-center py-8">
        {/* Avatar */}
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-8">
          <span className="text-brand-purple-dark font-bold text-lg">
            {user?.nome?.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-auto text-white hover:text-brand-pink transition-colors"
          title="Sair"
        >
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-brand-purple-dark text-sm">→</span>
          </div>
          <div className="text-xs mt-1">Sair</div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-8 py-6 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-brand-purple-dark">
            Olá, investidor!
          </h1>
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
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Saldo Disponível */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm opacity-80 mb-2">Saldo disponível</h3>
                  <p className="text-3xl font-bold">R$ 5.000,00</p>
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-colors">
                  Sacar
                </button>
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

            {/* Rentabilidade */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white">
              <h3 className="text-sm opacity-80 mb-2">Rentabilidade</h3>
              <p className="text-3xl font-bold">2.4%</p>
            </div>

            {/* Total Investido */}
            <div className="bg-gradient-to-br from-brand-purple-light to-brand-purple-dark rounded-2xl p-6 text-white">
              <h3 className="text-sm opacity-80 mb-2">Total investido</h3>
              <p className="text-3xl font-bold">R$ 10.000,00</p>
            </div>
          </div>

          {/* Investimentos Ativos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-4">
              Investimentos ativos
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-gray-600">Nome</th>
                    <th className="text-left py-3 text-gray-600">Investido</th>
                    <th className="text-left py-3 text-gray-600">Prazo</th>
                    <th className="text-left py-3 text-gray-600">Data de início</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">XXXXXXXXXXX</td>
                    <td className="py-3 text-gray-800">R$ 1.000</td>
                    <td className="py-3 text-gray-800">12 meses</td>
                    <td className="py-3 text-gray-800">01/01/2025</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">XXXXXXXXXXX</td>
                    <td className="py-3 text-gray-800">R$ 2.000</td>
                    <td className="py-3 text-gray-800">10 meses</td>
                    <td className="py-3 text-gray-800">14/02/2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Extrato e Movimentações */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-purple-dark mb-4">
              Extrato e movimentações
            </h2>
            
            {/* Filtros */}
            <div className="flex space-x-4 mb-6">
              <select className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-pink">
                <option>Período</option>
                <option>Último mês</option>
                <option>Últimos 3 meses</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-pink">
                <option>Tipo</option>
                <option>Investimento</option>
                <option>Resgate</option>
              </select>
            </div>

            {/* Movimentações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-brand-pink/20 rounded"></div>
                  <span className="text-gray-800">XXXXXXXXXXXXXXXX</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800">R$ 520,00</span>
                  <div className="w-2 h-8 bg-brand-pink rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-6 bg-brand-pink/20 rounded"></div>
                  <span className="text-gray-800">XXXXXXXXXXXXXXXXXXXX</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800">R$ 150,00</span>
                  <div className="w-2 h-6 bg-brand-pink rounded"></div>
                </div>
              </div>
            </div>

            {/* Botões de Relatório */}
            <div className="flex space-x-4 mt-6">
              <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-colors">
                <span>📄</span>
                <span>Relatório de Imposto de Renda</span>
              </button>
              <button className="bg-brand-pink hover:bg-brand-pink-light text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-colors">
                <span>📊</span>
                <span>Relatório de Carteira</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
