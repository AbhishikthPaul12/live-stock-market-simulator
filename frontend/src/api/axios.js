import axios from "axios";

const API = axios.create({
  baseURL: (window.location.hostname === "localhost" ? "http://localhost:5000" : "") + "/api"
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

export default API;