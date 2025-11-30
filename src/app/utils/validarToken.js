import jwtDecode from "jwt-decode";

export function validarToken(token) {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const agora = Date.now() / 1000;

    return decoded.exp > agora; // true se não expirou
  } catch (e) {
    return false;
  }
}