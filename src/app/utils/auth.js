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
      // Salvar usuário logado
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, message: 'Email ou senha incorretos' };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, message: 'Erro interno do sistema' };
  }
};

// Função para obter usuário logado
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Erro ao obter usuário logado:', error);
    return null;
  }
};

// Função para fazer logout
export const logout = () => {
  try {
    localStorage.removeItem('currentUser');
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
};

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
