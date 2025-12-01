import { authService } from "./authService";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://residencia-crowndfundig-backend.onrender.com/";

export async function api(endpoint, { method = "GET", body, token, headers = {} } = {}) {
  const authToken = token || localStorage.getItem("authToken");

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (authToken) {
    config.headers["Authorization"] = `Bearer ${authToken}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  console.log("📡 API Request:", {
    url: `${BASE_URL}${endpoint}`,
    method,
    body,
    headers: config.headers,
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let responseData = null;
  try {
    responseData = await response.json();
  } catch (e) {
    console.warn("⚠️ API: resposta não é JSON");
  }

  console.log("📩 API Response:", {
    status: response.status,
    ok: response.ok,
    data: responseData,
  });

  if (!response.ok) {
    throw new Error(responseData?.message || responseData?.error || "Erro na API");
  }

  return responseData;
}
