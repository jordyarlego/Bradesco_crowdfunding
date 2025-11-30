import { api } from "./api";

export const authService = {
  async login(credentials) {
    try {
      const response = await api("auth/login", {
        method: "POST",
        body: credentials,
        // Não precisa de token no login
      });

      // Salva o token após login bem-sucedido
      this.saveAuthData(response.token, response.usuario);
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    const token = this.getAuthToken();
    return api("auth/logout", {
      method: "POST",
      token: token, // Passa o token aqui
    });
  },

  clearAuthData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }
  },

  async completeLogout() {
    try {
      await this.logout();
    } catch (error) {
      console.warn("Erro ao fazer logout no servidor:", error);
    } finally {
      this.clearAuthData();
    }
  },

  saveAuthData(token, userData) {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("authToken", token);
      }
      if (userData) {
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    }
  },

  getAuthToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },

  getUserData() {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  getCurrentUser() {
  if (typeof window === 'undefined') {
    console.log('🚫 getCurrentUser: Executando no servidor, retornando null');
    return null;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('🔍 getCurrentUser - Token:', token ? 'Presente' : 'Ausente');
    console.log('🔍 getCurrentUser - UserData:', userData);
    
    if (!token || !userData) {
      console.log('❌ getCurrentUser: Token ou userData ausente');
      return null;
    }
    
    const user = JSON.parse(userData);
    console.log('✅ getCurrentUser: Usuário recuperado:', user);
    
    return {
      ...user,
      token: token // Garante que o token está incluído
    };
  } catch (error) {
    console.error('💥 Erro em getCurrentUser:', error);
    return null;
  }
},

  isInvestor() {
  const user = getCurrentUser();
  console.log('🔍 isInvestor - Usuário:', user);
  console.log('🔍 isInvestor - Role:', user?.role);
  
  const isInvestor = user && user.role === 'investidor';
  console.log('🔍 isInvestor - Resultado:', isInvestor);
  
  return isInvestor;
},

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  },

  isAuthenticated() {
    return !!this.getAuthToken();
  },

  // Método auxiliar para fazer requisições autenticadas
  authenticatedApi(endpoint, options = {}) {
    const token = this.getAuthToken();
    return api(endpoint, {
      ...options,
      token: token, // Passa o token automaticamente
    });
  },
};
