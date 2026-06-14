import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    if (data && typeof data === "object") {
      const message = data.detail || data.message || data.non_field_errors || error.message;
      const wrapped = new Error(message);
      Object.assign(wrapped, data);
      return Promise.reject(wrapped);
    }
    return Promise.reject(error);
  }
);

export function unwrap(response) {
  return response.data;
}
