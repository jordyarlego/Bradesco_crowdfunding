import { api } from "./api";

export const authService = {
  async login(credentials) {
    const response = await api("auth/login", {
      method: "POST",
      body: credentials,
    });

    this.saveAuthData(response.token, response.usuario);
    return response;
  },

  logout() {
    const token = this.getAuthToken();

    return api("auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  saveAuthData(token, user) {
    if (typeof window === "undefined") return;

    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(user));
  },

  clearAuthData() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  },

  getAuthToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  },

  getUser() {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated() {
    return !!this.getAuthToken();
  },
};
