'use client';

// src/app/components/Header.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser, logout, isLoggedIn } from '../utils/auth';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoggedIn(isLoggedIn());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setLoggedIn(false);
    router.push('/');
  };

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
          <Link href="/como-funciona" className="hover:text-brand-pink transition-colors">
            Como funciona
          </Link>
          <Link href="/contato" className="hover:text-brand-pink transition-colors">
            Contato
          </Link>
        </nav>

        {/* Botão de Entrada ou Logout */}
        {loggedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">
              Olá, {user?.nome?.split(' ')[0]}!
            </span>
            <button
              onClick={handleLogout}
              className="bg-brand-pink hover:bg-brand-pink-light rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors shadow-lg"
            >
              Sair
            </button>
          </div>
        ) : (
          <Link href="/entrar">
            <button className="bg-brand-pink hover:bg-brand-pink-light rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors shadow-lg">
              Entrar
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}