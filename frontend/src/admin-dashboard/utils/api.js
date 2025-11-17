// src/utils/api.js
import axios from "axios";

// direct URL to your backend (you run backend on port 3001)
const api = axios.create({
  baseURL: "http://localhost:3001/api",
  // you can add headers here later if you need auth
});

export default api;
