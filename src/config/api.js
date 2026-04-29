const API_URL =
  (import.meta.env.MODE === "development"
    ? "http://localhost:3001"
    : "https://carfex-backend-docker.onrender.com");

export default API_URL;