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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // 🔥 Modificado: Só redirecionar após verificação completa
  useEffect(() => {
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      if (autenticado && usuario) {
        console.log("Usuário já autenticado, redirecionando...", usuario);
        
        const role = usuario.role || usuario.tipo;
        const redirectMap = {
          'investidor': '/dashboard-investidor',
          'tomador': '/dashboard-tomador', 
          'admin': '/dashboard-admin'
        };

        const redirectPath = redirectMap[role] || '/dashboard';
        router.push(redirectPath);
      }
    }
  }, [autenticado, loading, usuario, router, hasCheckedAuth]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // ... validações ...

    try {
      const data = await authService.login({
        email: formData.email,
        senha: formData.senha,
      });

      console.log("Resposta do login:", data);

      if (!data || !data.token || !data.usuario) {
        throw new Error("Resposta inesperada do servidor.");
      }

      // 🔥 IMPORTANTE: Redirecionar APENAS após login bem-sucedido
      // Remova o setTimeout e redirecione diretamente
      const loginSuccess = login({
        usuario: data.usuario,
        token: data.token,
      });

      if (!loginSuccess) {
        throw new Error("Erro ao salvar dados de autenticação.");
      }

      // Redirecionar imediatamente após login
      const role = data.usuario.role || data.usuario.tipo;
      console.log("Role do usuário:", role);

      const redirectMap = {
        'investidor': '/dashboard-investidor',
        'tomador': '/dashboard-tomador', 
        'admin': '/dashboard-admin'
      };

      const redirectPath = redirectMap[role] || '/dashboard';
      console.log("Redirecionando para:", redirectPath);
      router.push(redirectPath);

    } catch (error) {
      console.error("Erro no login:", error);
      setMessage(error.message || "Erro ao fazer login. Verifique suas credenciais.");
      setIsLoading(false);
    }
  };

  // 🔥 MOSTRAR LOADING apenas enquanto verifica autenticação
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

  // 🔥 REMOVA esta verificação - o useEffect já cuida do redirecionamento
  // if (autenticado) { ... }


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
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all duration-300"
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">
                  🔒
                </div>
              </div>

              {/* Esqueci a senha */}
              <div className="text-right">
                <Link
                  href="/esqueci-senha"
                  className="text-brand-pink hover:text-brand-pink-light transition-colors text-sm"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-pink hover:bg-brand-pink-light text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Botão Cadastrar */}
            <Link href="/registro">
              <button 
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20"
                disabled={isLoading}
              >
                Criar nova conta
              </button>
            </Link>

            {/* Link para Cadastro */}
            <div className="text-center mt-6">
              <p className="text-white/70">
                Não tem uma conta?{" "}
                <Link
                  href="/registro"
                  className="text-brand-pink hover:text-brand-pink-light transition-colors"
                >
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