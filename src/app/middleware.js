// middleware.js - Versão Corrigida
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('authToken')?.value;
  const userData = request.cookies.get('userData')?.value;
  const { pathname } = request.nextUrl;

  // Rotas protegidas por role
  const protectedRoutes = {
    '/dashboard-investidor': 'investidor',
    '/dashboard-tomador': 'tomador',
    '/dashboard-admin': 'admin'
  };

  // Verificar se está tentando acessar rota protegida
  const currentRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  // 🔴 Bloquear acesso sem token
  if (currentRoute && !token) {
    return NextResponse.redirect(new URL('/entrar', request.url));
  }

  // 🔴 Bloquear acesso com role incorreta
  if (currentRoute && token && userData) {
    try {
      const user = JSON.parse(userData);
      const requiredRole = protectedRoutes[currentRoute];
      
      if (user.role !== requiredRole) {
        // Redireciona para dashboard apropriado baseado na role real
        const redirectPath = user.role === 'investidor' ? '/dashboard-investidor' :
                           user.role === 'tomador' ? '/dashboard-tomador' :
                           user.role === 'admin' ? '/dashboard-admin' : '/';
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch (error) {
      console.error('Erro ao parsear userData no middleware:', error);
    }
  }

  // ✅ Se já está logado e tenta acessar login/registro, redireciona para dashboard apropriado
  if (token && userData && (pathname === '/entrar' || pathname === '/registro')) {
    try {
      const user = JSON.parse(userData);
      const redirectPath = user.role === 'investidor' ? '/dashboard-investidor' :
                         user.role === 'tomador' ? '/dashboard-tomador' :
                         user.role === 'admin' ? '/dashboard-admin' : '/';
      
      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch (error) {
      console.error('Erro ao redirecionar usuário logado:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard-investidor/:path*',
    '/dashboard-tomador/:path*',
    '/dashboard-admin/:path*',
    '/entrar',
    '/registro'
  ]
};