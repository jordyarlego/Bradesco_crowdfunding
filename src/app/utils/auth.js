// src/app/utils/auth.js

// Função para salvar usuário no localStorage
export const saveUser = (userData) => {
  try {
    const users = getUsers();
    const existingUserIndex = users.findIndex(user => user.email === userData.email);
    
    if (existingUserIndex >= 0) {
      // Atualizar usuário existente
      users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
    } else {
      // Adicionar novo usuário
      users.push({
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    return false;
  }
};

// Função para obter todos os usuários
export const getUsers = () => {
  try {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    return [];
  }
};

// Função para fazer login
export const login = (email, senha) => {
  try {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.senha === senha);
    
    if (user) {
      const fakeToken = `token-${user.id}-${Date.now()}`;
      
      localStorage.setItem("authToken", fakeToken);
      localStorage.setItem("userData", JSON.stringify(user));
      
      return { success: true, user, token: fakeToken };
    }

    return { success: false, message: "Email ou senha incorretos" };
  } catch (error) {
    return { success: false, message: "Erro interno do sistema" };
  }
};

// Função para obter usuário logado
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) return null;
    
    const user = JSON.parse(userData);
    return {
      ...user,
      token: token
    };
  } catch (error) {
    console.error('Erro ao recuperar usuário:', error);
    return null;
  }
};

// Função para fazer logout
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  return true;
}

// Função para verificar se usuário está logado
export const isLoggedIn = () => {
  return getCurrentUser() !== null;
};

// Função para verificar se é investidor
export const isInvestor = () => {
  const user = getCurrentUser();
  return user && user.tipo === 'investidor';
};

// Função para verificar se é tomador
export const isBorrower = () => {
  const user = getCurrentUser();
  return user && user.tipo === 'tomador';
};
