// src/services/aplicacaoService.js
import { api } from "./api";

export const aplicacaoService = {
  async aplicar(usuarioId, investimentoId, valor, token) {
    return await api(`aplicacoes/${investimentoId}`, {
      method: "POST",
      body: {
        usuarioId,        
        valor: valor,
      },
      token,
    });
  },

  async listarAplicacoes(token) {
    return await api("aplicacoes", {
      method: "GET",
      token,
    });
  },

  async listarPorInvestimento(investimentoId, token) {
    return await api(`aplicacoes/investimento/${investimentoId}`, {
      method: "GET",
      token,
    });
  },

  async listarPorUsuario(usuarioId, token) {
    return await api(`aplicacoes/usuario/${usuarioId}`, {
      method: "GET",
      token,
    });
  },

  async buscarPorId(id, token) {
    return await api(`aplicacoes/${id}`, {
      method: "GET",
      token,
    });
  },
};
