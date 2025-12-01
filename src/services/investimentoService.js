// src/services/investimentoService.js
import { api } from "./api";

export const investimentoService = {
  async criarInvestimento(data, token) {
    return await api("investimentos", {
      method: "POST",
      body: data,
      token,
    });
  },

  async listarInvestimentos(token) {
    try {
      const response = await api("investimentos", {
        method: "GET",
        token,
      });

      return response;
    } catch (error) {
      console.error("❌ Service: Erro ao buscar investimentos:", error);
      throw error;
    }
  },
  async buscarInvestimentoPorId(id, token) {
    return await api(`investimentos/${id}`, {
      method: "GET",
      token,
    });
  },

  async atualizarStatus(id, status) {
    return await api(`investimentos/${id}/status`, {
      method: "PUT",
      body: { status },
      token,
    });
  },

  async deletarInvestimento(id) {
    return await api(`investimentos/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
