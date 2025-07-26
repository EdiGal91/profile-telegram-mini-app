import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging in development
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        params: config.params,
        data: config.data,
      }
    );

    return config;
  });

  api.interceptors.response.use(
    (response) => {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          data: response.data,
        }
      );
      return response;
    },
    (error) => {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`,
        {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        }
      );
      return Promise.reject(error);
    }
  );
}
