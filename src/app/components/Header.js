"use client";

// src/app/components/Header.js

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuthContext } from "../utils/authContext";

export default function Header() {
  const router = useRouter();
  const { usuario, autenticado, logout } = useContext(AuthContext);
  const [mounted, setMounted] = useState(false);

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Evita renderização inconsistente entre server e client
  if (!mounted) {
    return (
      <header className="py-6">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </Link>

          {/* Navegação Principal */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-brand-pink transition-colors">
              Início
            </Link>
            <Link
              href="/como-funciona"
              className="hover:text-brand-pink transition-colors"
            >
              Como funciona
            </Link>
            <Link
              href="/contato"
              className="hover:text-brand-pink transition-colors"
            >
              Contato
            </Link>
          </nav>

          {/* Placeholder enquanto carrega */}
          <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="py-6">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </Link>

        {/* Navegação Principal */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:text-brand-pink transition-colors">
            Início
          </Link>
          <Link
            href="/como-funciona"
            className="hover:text-brand-pink transition-colors"
          >
            Como funciona
          </Link>
          <Link
            href="/contato"
            className="hover:text-brand-pink transition-colors"
          >
            Contato
          </Link>
        </nav>

        {/* Botão de Entrada ou Logout */}

        <Link href="/entrar">
          <button className="bg-brand-pink hover:bg-brand-pink-light rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors shadow-lg">
            Entrar
          </button>
        </Link>
      </div>
    </header>
  );
}
