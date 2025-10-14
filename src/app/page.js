// src/app/page.js

import Header from './components/Header';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Seção Hero */}
        <section className="h-screen flex items-center overflow-hidden">
          <div className="container mx-auto px-4 flex items-center justify-between w-full">
            
            {/* Conteúdo Principal - Lado Esquerdo */}
            <div className="flex-1 max-w-2xl">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Invista em Pessoas.
                </h1>
                <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Receba com Segurança.
                </h2>
              </div>
              
              <p className="text-xl text-gray-300 max-w-lg mt-8 mb-10">
                Sociedade de Empréstimo entre Pessoas: confiança, transparência e regulamentação em um só lugar.
              </p>
              
              <Link href="/registro">
                <button className="bg-brand-pink hover:bg-brand-pink-light text-white font-bold px-16 py-8 rounded-full text-xl transition-all duration-300 shadow-2xl transform hover:scale-110 hover:shadow-brand-pink/25 animate-pulse hover:animate-none">
                  Comece agora!
                </button>
              </Link>
            </div>

            {/* Seção da Imagem - Lado Direito */}
            <div className="flex-1 relative flex justify-end items-center">
              {/* Container principal */}
              <div className="relative w-[700px] h-[700px] flex items-center justify-end">
                
                {/* Círculo de fundo com efeito especial */}
                <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-brand-purple-light/30 to-brand-purple-dark/50 animate-pulse">
                  {/* Efeito de ondas concêntricas */}
                  <div className="absolute inset-0 rounded-full border-2 border-brand-pink/20 animate-ping"></div>
                  <div className="absolute inset-4 rounded-full border border-brand-pink-light/30 animate-ping" style={{animationDelay: '1s'}}></div>
                  <div className="absolute inset-8 rounded-full border border-brand-pink/20 animate-ping" style={{animationDelay: '2s'}}></div>
                  
                  {/* Partículas flutuantes */}
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-pink rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-brand-pink-light rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
                  <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
                </div>
                
                {/* Imagem da mulher - um pouco maior */}
                <div className="relative z-10 w-[580px] h-[580px] -mr-20">
                  <Image 
                    src="/mulher.png" 
                    alt="Mulher com smartphone" 
                    width={580} 
                    height={580} 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Bubbles Informativos - reorganizados para não se sobreporem */}
                {/* Bubble 1 - R$ 50 milhões */}
                <div className="absolute z-20 top-12 left-12 bg-brand-pink-bubble text-brand-purple-dark p-5 rounded-2xl shadow-xl animate-float backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">💰</span>
                    <div>
                      <p className="font-bold text-lg">R$ 50 milhões</p>
                      <p className="text-sm">já investidos</p>
                    </div>
                  </div>
                </div>

                {/* Bubble 2 - Receba direto */}
                <div className="absolute z-20 top-1/2 left-8 transform -translate-y-1/2 bg-brand-pink-bubble text-brand-purple-dark p-5 rounded-2xl shadow-xl animate-float backdrop-blur-sm" style={{animationDelay: '2s'}}>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">🤝</span>
                    <div>
                      <p className="font-bold text-lg">Receba direto</p>
                      <p className="text-sm">na sua conta</p>
                    </div>
                  </div>
                </div>

                {/* Bubble 3 - +1.000 Usuários */}
                <div className="absolute z-20 bottom-32 left-20 bg-brand-pink-bubble text-brand-purple-dark p-5 rounded-2xl shadow-xl animate-float backdrop-blur-sm" style={{animationDelay: '4s'}}>
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-1">
                      <div className="w-7 h-7 bg-brand-pink rounded-full border-2 border-white"></div>
                      <div className="w-7 h-7 bg-brand-pink-light rounded-full border-2 border-white"></div>
                      <div className="w-7 h-7 bg-brand-purple-light rounded-full border-2 border-white"></div>
                      <div className="w-7 h-7 bg-brand-purple-dark rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-bold text-lg">+1.000</p>
                      <p className="text-sm">Usuários ativos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}