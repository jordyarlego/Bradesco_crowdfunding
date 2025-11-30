// src/services/investimentoService.js
import { api } from "./api";
import { authService } from "./authService";

export const investimentoService = {
  async criarInvestimento(data) {
    return await api("investimentos", {
      method: "POST",
      body: data,
    });
  },

  async listarInvestimentos() {
    return await api("investimentos", {
      method: "GET",
    });
  },

  async buscarInvestimentoPorId(id) {
    return await api(`investimentos/${id}`, {
      method: "GET",
    });
  },

  async atualizarStatus(id, status) {
    return await api(`investimentos/${id}/status`, {
      method: "PUT",
      body: { status },
    });
  },

  async deletarInvestimento(id) {
    return await api(`investimentos/${id}`, {
      method: "DELETE",
    });
  },

  // Método específico para investimentos do usuário logado
  async listarMeusInvestimentos() {
    return await api("investimentos/meus", {
      method: "GET",
    });
  },
};