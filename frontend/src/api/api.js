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
      // Transform fields to match schema
      const transformedData = {
        ...userData,
        tipoutente: userData.ruolo?.toLowerCase(),
        cf: userData.codiceFiscale,
        datanascita: userData.dataNascita,
        grupposanguigno: userData.gruppoSanguigno,
      };
      delete transformedData.ruolo;
      delete transformedData.codiceFiscale;
      delete transformedData.dataNascita;
      delete transformedData.gruppoSanguigno;

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    }
  },
  admin: {
    // User Management
    getUsers: () => api.protected.request('/api/admin/users'),
    createUser: (userData) => api.protected.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        datanascita: new Date(userData.datanascita).toISOString()
      })
    }),
    updateUser: (cf, userData) => api.protected.request(`/api/admin/users/${cf}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...userData,
        datanascita: userData.datanascita ? new Date(userData.datanascita).toISOString() : undefined
      })
    }),
    deleteUser: (cf) => api.protected.request(`/api/admin/users/${cf}`, {
      method: 'DELETE'
    }),

    // Operating Room Management
    getRooms: () => api.protected.request('/api/admin/operating-rooms'),
    createRoom: (roomData) => api.protected.request('/api/admin/operating-rooms', {
      method: 'POST',
      body: JSON.stringify({
        nome: roomData.nome,
        attrezzature: roomData.attrezzature
      })
    }),
    updateRoom: (id_sala, roomData) => api.protected.request(`/api/admin/operating-rooms/${id_sala}`, {
      method: 'PATCH',
      body: JSON.stringify({
        nome: roomData.nome,
        attrezzature: roomData.attrezzature
      })
    }),

    // Equipment Management
    getEquipment: () => api.protected.request('/api/admin/equipment'),
    createEquipment: (equipmentData) => api.protected.request('/api/admin/equipment', {
      method: 'POST',
      body: JSON.stringify({
        nome: equipmentData.nome
      })
    }),
    updateEquipment: (id_attrezzatura, equipmentData) => api.protected.request(
      `/api/admin/equipment/${id_attrezzatura}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nome: equipmentData.nome
        })
      }
    ),

    // Surgery Types Management
    getSurgeryTypes: () => api.protected.request('/api/admin/surgery-types'),
    createSurgeryType: (typeData) => api.protected.request('/api/admin/surgery-types', {
      method: 'POST',
      body: JSON.stringify({
        nome: typeData.nome,
        durata: parseInt(typeData.durata),
        complessita: typeData.complessita.toLowerCase(),
        attrezzature: typeData.attrezzature?.map(Number)
      })
    }),

    // Statistics
    getStatistics: (startDate, endDate) => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return api.protected.request(`/api/admin/statistics?${params}`);
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
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Request failed');
      }
      return response.json();
    }
  }
};