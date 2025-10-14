'use client';

// src/app/entrar/page.js

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Link from 'next/link';
import { login } from '../utils/auth';

export default function Entrar() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
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

    // Validação básica
    if (!formData.email || !formData.senha) {
      setMessage('Por favor, preencha todos os campos.');
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

    // Tentar fazer login
    const result = login(formData.email, formData.senha);
    
    if (result.success) {
      setMessage('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        // Redirecionar baseado no tipo de usuário
        if (result.user.tipo === 'investidor') {
          router.push('/dashboard-investidor');
        } else {
          router.push('/dashboard-tomador');
        }
      }, 1500);
    } else {
      setMessage(result.message);
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
                Bem-vindo de volta
              </h1>
              <p className="text-white/70">
                Entre na sua conta para continuar
              </p>
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
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">
                  ✉️
                </div>
              </div>

              {/* Senha */}
              <div className="relative">
                <input
                  type="password"
                  name="senha"
                  placeholder="Sua senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">
                  🔒
                </div>
              </div>

              {/* Esqueci a senha */}
              <div className="text-right">
                <Link href="/esqueci-senha" className="text-brand-pink hover:text-brand-pink-light transition-colors text-sm">
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-pink hover:bg-brand-pink-light text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-white/70 text-sm">ou</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Botão Cadastrar */}
            <Link href="/registro">
              <button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20">
                Criar nova conta
              </button>
            </Link>

            {/* Link para Cadastro */}
            <div className="text-center mt-6">
              <p className="text-white/70">
                Não tem uma conta?{' '}
                <Link href="/registro" className="text-brand-pink hover:text-brand-pink-light transition-colors">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
