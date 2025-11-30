import { authService } from './authService';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://residencia-crowndfundig-backend.onrender.com/";

export async function api(endpoint, { method = "GET", body, token, headers = {} } = {}) {
  
  const authToken = token || authService.getAuthToken();
  
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  console.log('Fazendo requisição para:', `${BASE_URL}${endpoint}`);
  console.log('Token usado:', authToken ? 'Sim' : 'Não');

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `Erro ${res.status}: ${errorText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Mantém a mensagem original se não for JSON
    }
    
    throw new Error(errorMessage);
  }

  return res.json();
}