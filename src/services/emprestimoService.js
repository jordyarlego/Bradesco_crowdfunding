// src/services/emprestimoService.js
import { api } from "./api";

export const emprestimoService = {
  async criarEmprestimo(data, token) {
    return await api("emprestimos", {
      method: "POST",
      body: data,
      token,
    });
  },

  async listarEmprestimos(token) {
    return await api("emprestimos", {
      method: "GET",
      token,
    });
  },

  async buscarEmprestimoPorId(id, token) {
    return await api(`emprestimos/${id}`, {
      method: "GET",
      token,
    });
  },

  async listarEmprestimosPorTomador(tomadorId, token) {
    return await api(`emprestimos/tomador/${tomadorId}`, {
      method: "GET",
      token,
    });
  },

  async atualizarEmprestimo(id, data, token) {
    return await api(`emprestimos/${id}`, {
      method: "PUT",
      body: data,
      token,
    });
  },

  async deletarEmprestimo(id, token) {
    return await api(`emprestimos/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
