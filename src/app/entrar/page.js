"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Link from "next/link";
import { AuthContext } from "@/app/utils/authContext";
import { authService } from "@/services/authService";

export default function Entrar() {
  const router = useRouter();
  const { login, autenticado, loading, usuario } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔥 Se o usuário já estiver autenticado → redireciona automaticamente
  useEffect(() => {
    if (!loading && autenticado && usuario) {
      const role = usuario.role || usuario.tipo;

      const redirectMap = {
        investidor: "/dashboard-investidor",
        tomador: "/dashboard-tomador",
        admin: "/dashboard-admin",
      };

      router.push(redirectMap[role] || "/dashboard");
    }
  }, [autenticado, loading, usuario, router]);

  // 🔥 Input change handler
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Submit handler (com AuthContext atualizado)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!formData.email || !formData.senha) {
      setMessage("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Email inválido.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        senha: formData.senha,
      });

      if (!result.success) {
        setMessage(result.message || "Falha no login.");
        setIsLoading(false);
        return;
      }

      setMessage("Login realizado com sucesso! Redirecionando...");

      const loginSuccess = login({
        usuario: data.usuario,
        token: data.token,
      });

      if (!loginSuccess) {
        throw new Error("Erro ao salvar autenticação.");
      }

      setMessage("Login realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        const role = data.usuario.role || data.usuario.tipo;

        const redirectMap = {
          investidor: "/dashboard-investidor",
          tomador: "/dashboard-tomador",
          admin: "/dashboard-admin",
        };

        router.push(redirectMap[role] || "/");
      }, 1200);
    } catch (error) {
      console.error("Erro no login:", error);
      setMessage(error.message || "Erro ao fazer login.");
      setIsLoading(false);
    }
  };

  // 🔥 Loading inicial enquanto verifica autenticação
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-hero-gradient flex items-center justify-center">
          <p className="text-white text-xl">Verificando autenticação...</p>
        </main>
      </>
    );
  }

  // 🔥 Durante redirecionamento, evita mostrar o formulário
  if (autenticado) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-hero-gradient flex items-center justify-center">
          <p className="text-white text-xl">Redirecionando...</p>
        </main>
      </>
    );
  }

  // 🔥 FORMULÁRIO (Usuário não autenticado)
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
              <p className="text-white/70">Entre na sua conta para continuar</p>
            </div>

            {/* Mensagem */}
            {message && (
              <div
                className={`p-4 rounded-full text-center mb-6 ${
                  message.includes("sucesso")
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
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
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:ring-2 focus:ring-brand-pink transition"
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70">
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
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:ring-2 focus:ring-brand-pink transition"
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70">
                  🔒
                </div>
              </div>

              {/* Esqueci a senha */}
              <div className="text-right">
                <Link
                  href="/esqueci-senha"
                  className="text-brand-pink hover:text-brand-pink-light transition text-sm"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                className="w-full bg-brand-pink hover:bg-brand-pink-light text-white font-bold py-4 rounded-full text-lg transition transform hover:scale-105 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-white/70 text-sm">ou</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Cadastrar */}
            <Link href="/registro">
              <button className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-full hover:bg-white/20 transition transform hover:scale-105">
                Criar nova conta
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
