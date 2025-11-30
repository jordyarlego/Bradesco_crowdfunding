// src/services/pagamentoService.js
import { api } from "./api";

export const pagamentoService = {
  async criarPagamento(data, token) {
    return await api("pagamentos", {
      method: "POST",
      body: data,
      token,
    });
  },

  async listarPagamentos(token) {
    return await api("pagamentos", {
      method: "GET",
      token,
    });
  },

  async listarPagamentosPorEmprestimo(emprestimoId, token) {
    return await api(`pagamentos/emprestimo/${emprestimoId}`, {
      method: "GET",
      token,
    });
  },

  async buscarPagamentoPorId(id, token) {
    return await api(`pagamentos/${id}`, {
      method: "GET",
      token,
    });
  },

  async atualizarStatus(id, status, token) {
    return await api(`pagamentos/${id}/status`, {
      method: "PUT",
      body: { status },
      token,
    });
  },

  async deletarPagamento(id, token) {
    return await api(`pagamentos/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
