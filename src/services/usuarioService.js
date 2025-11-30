// src/services/usuarioService.js
import { api } from "./api";

export const usuarioService = {
  async criarUsuario(dados) {
    return await api("usuarios", {
      method: "POST",
      body: dados      
    });
  },

  async listarUsuarios(token) {
    return await api("usuarios", {
      method: "GET",
      token,
    });
  },

  async buscarPorId(id, token) {
    return await api(`usuarios/${id}`, {
      method: "GET",
      token,
    });
  },

  async atualizarSenha(id, senha, token) {
    return await api(`usuarios/${id}/senha`, {
      method: "PUT",
      body: { senha },
      token,
    });
  },

  async atualizarSaldo(id, saldo, token) {
    return await api(`usuarios/${id}/saldo`, {
      method: "PUT",
      body: { saldo },
      token,
    });
  },

  async deletarUsuario(id, token) {
    return await api(`usuarios/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
