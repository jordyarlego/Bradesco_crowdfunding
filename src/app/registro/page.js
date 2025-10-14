'use client';

// src/app/registro/page.js

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { saveUser } from '../utils/auth';

export default function Registro() {
  const router = useRouter();
  const [userType, setUserType] = useState('investidor');
  const [formData, setFormData] = useState({
    nome: '',
    senha: '',
    cpf: '',
    endereco: '',
    telefone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validação avançada
    if (!formData.nome || !formData.email || !formData.senha || !formData.cpf || !formData.telefone) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    // Validação de email
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Email inválido.');
      setIsLoading(false);
      return;
    }

    // Validação de telefone: deve ter exatamente 11 dígitos
    const telefoneRegex = /^\d{11}$/;
    if (!telefoneRegex.test(formData.telefone)) {
      setMessage('Telefone inválido. Digite 11 números, incluindo o DDD.');
      setIsLoading(false);
      return;
    }

    // Validação de CPF (simples, apenas dígitos e tamanho)
    const cpfRegex = /^\d{11}$/;
    if (userType === 'investidor' && !cpfRegex.test(formData.cpf.replace(/\D/g, ''))) {
      setMessage('CPF inválido. Deve conter 11 dígitos.');
      setIsLoading(false);
      return;
    }

    // Validação de CPF ou CNPJ para tomador
    const cnpjRegex = /^\d{14}$/;
    if (userType === 'tomador') {
      const clean = formData.cpf.replace(/\D/g, '');
      if (!(cpfRegex.test(clean) || cnpjRegex.test(clean))) {
        setMessage('CPF/CNPJ inválido. Informe 11 ou 14 dígitos.');
        setIsLoading(false);
        return;
      }
    }

    // Salvar usuário
    const userData = {
      ...formData,
      tipo: userType
    };

    const success = saveUser(userData);
    
    if (success) {
      setMessage('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        router.push('/entrar');
      }, 2000);
    } else {
      setMessage('Erro ao realizar cadastro. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-hero-gradient">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            
            {/* Título */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Cadastre-se agora
              </h1>
            </div>

            {/* Seleção de Tipo de Usuário */}
            <div className="mb-8">
              <p className="text-white text-center mb-4">Você será...</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setUserType('investidor')}
                  className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    userType === 'investidor'
                      ? 'bg-brand-pink text-white shadow-lg'
                      : 'bg-white text-brand-purple-dark hover:bg-gray-100'
                  }`}
                >
                  Investidor
                </button>
                <button
                  onClick={() => setUserType('tomador')}
                  className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    userType === 'tomador'
                      ? 'bg-brand-pink text-white shadow-lg'
                      : 'bg-white text-brand-purple-dark hover:bg-gray-100'
                  }`}
                >
                  Tomador
                </button>
              </div>
            </div>

            {/* Mensagem */}
            {message && (
              <div className={`p-4 rounded-full text-center mb-6 ${
                message.includes('sucesso') 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {message}
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Completo */}
              <div className="relative">
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome completo"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">
                  👤
                </div>
              </div>

              {/* Senha */}
              <div className="relative">
                <input
                  type="password"
                  name="senha"
                  placeholder="Crie uma senha forte"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">
                  🔒
                </div>
              </div>

              {/* CPF/CNPJ e Telefone lado a lado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="cpf"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={userType === 'investidor' ? 'CPF' : 'CPF/CNPJ'}
                    value={formData.cpf}
                    maxLength={11}
                    onChange={e => {
                      // Aceita somente números e limita a 11 dígitos
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 11) val = val.slice(0, 11);
                      setFormData({ ...formData, cpf: val });
                    }}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="telefone"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.telefone}
                    maxLength={11}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 11) val = val.slice(0, 11);
                      setFormData({ ...formData, telefone: val });
                    }}
                    placeholder="Telefone"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 text-sm">
                    📞
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="relative">
                <input
                  type="text"
                  name="endereco"
                  placeholder="Endereço"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 text-sm">
                  ✉️
                </div>
              </div>

              {/* Botão Feito */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-brand-purple-dark font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Cadastrando...' : 'Feito'}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-white/70 text-sm">ou</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Botão Entrar */}
            <Link href="/entrar">
              <button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20">
                Já tenho uma conta
              </button>
            </Link>

            {/* Link para Login */}
            <div className="text-center mt-6">
              <p className="text-white/70">
                Já tem uma conta?{' '}
                <Link href="/entrar" className="text-brand-pink hover:text-brand-pink-light transition-colors">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
