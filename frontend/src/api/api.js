const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = {
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    }
  },
  public: {
    getDoctors: async () => {
      const response = await fetch(`${API_URL}/api/public/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      return response.json();
    },
    getAvailableSlots: async (doctorId) => {
      const response = await fetch(`${API_URL}/api/public/slots/${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    }
  },
  protected: {
    request: async (endpoint, options = {}) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Request failed');
      return response.json();
    }
  }
};