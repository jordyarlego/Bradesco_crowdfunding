"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Link from "next/link";
import { usuarioService } from "@/services/usuarioService";

export default function Registro() {
  const router = useRouter();
  const [userType, setUserType] = useState("investidor");

  const [formData, setFormData] = useState({
    nome: "",
    senha: "",
    cpf: "",
    telefone: "",
    email: "",
    contaBancaria: "",
    agenciaBancaria: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    // === VALIDAÇÕES OBRIGATÓRIAS ===
    if (
      !formData.nome ||
      !formData.email ||
      !formData.senha ||
      !formData.cpf ||
      !formData.telefone
    ) {
      setMessage("Por favor, preencha todos os campos obrigatórios.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Email inválido.");
      setIsLoading(false);
      return;
    }

    const telefoneRegex = /^\d{11}$/;
    if (!telefoneRegex.test(formData.telefone)) {
      setMessage("Telefone inválido. Digite 11 números.");
      setIsLoading(false);
      return;
    }

    const doc = formData.cpf.replace(/\D/g, "");

    if (userType === "investidor" && doc.length !== 11) {
      setMessage("CPF inválido. Deve conter 11 dígitos.");
      setIsLoading(false);
      return;
    }

    if (userType === "tomador" && !(doc.length === 11 || doc.length === 14)) {
      setMessage("CPF/CNPJ inválido. Informe 11 ou 14 dígitos.");
      setIsLoading(false);
      return;
    }

    // === DADOS PARA A API ===
    const userData = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      telefone: formData.telefone,
      matricula: doc,
      role: userType,
      contaBancaria: formData.contaBancaria || null,
      agenciaBancaria: formData.agenciaBancaria || null,
    };

    try {
      const response = await usuarioService.criarUsuario(userData);

      if (response.error) {
        setMessage(response.error || "Erro ao cadastrar.");
      } else {
        setMessage("Cadastro realizado com sucesso! Redirecionando...");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (error) {
      setMessage("Erro ao realizar cadastro. Tente novamente.");
    }

    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-hero-gradient">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Cadastre-se agora
              </h1>
            </div>

            <div className="mb-8">
              <p className="text-white text-center mb-4">Você será...</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setUserType("investidor")}
                  className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                    userType === "investidor"
                      ? "bg-brand-pink text-white shadow-lg"
                      : "bg-white text-brand-purple-dark hover:bg-gray-100"
                  }`}
                >
                  Investidor
                </button>

                <button
                  onClick={() => setUserType("tomador")}
                  className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                    userType === "tomador"
                      ? "bg-brand-pink text-white shadow-lg"
                      : "bg-white text-brand-purple-dark hover:bg-gray-100"
                  }`}
                >
                  MEI
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-full text-center mb-6 ${
                  message.includes("sucesso")
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white"
              />

              <input
                type="password"
                name="senha"
                placeholder="Crie uma senha forte"
                value={formData.senha}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="cpf"
                  placeholder={
                    userType === "investidor"
                      ? "CPF (11 dígitos)"
                      : "CPF/CNPJ (11 / 14 dígitos)"
                  }
                  value={formData.cpf}
                  maxLength={14}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white"
                />

                <input
                  type="text"
                  name="telefone"
                  maxLength={11}
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Telefone"
                  className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white"
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white"
              />

              <>
                <input
                  type="text"
                  name="contaBancaria"
                  placeholder="Conta bancária"
                  value={formData.contaBancaria}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white"
                />

                <input
                  type="text"
                  name="agenciaBancaria"
                  placeholder="Agência bancária"
                  value={formData.agenciaBancaria}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white"
                />
              </>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-brand-purple-dark font-bold py-4 px-8 rounded-full text-lg hover:scale-105"
              >
                {isLoading ? "Cadastrando..." : "Feito"}
              </button>
            </form>

            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-white/70 text-sm">ou</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            <Link href="/entrar">
              <button className="w-full bg-white/10 border border-white/20 text-white font-semibold py-4 px-8 rounded-full hover:bg-white/20">
                Já tenho uma conta
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
