// API Configuration
// Use HTTP for development to avoid SSL certificate issues
// Switch to HTTPS when you want to demonstrate TLS encryption with Wireshark

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "https://localhost:3001";

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  profile: `${API_BASE_URL}/api/user/profile`,
  health: `${API_BASE_URL}/api/health`,
};
