const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000';

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
        tipoutente: userData.tipoutente?.toLowerCase(),
        cf: userData.cf,
        datanascita: userData.datanascita,
        grupposanguigno: userData.grupposanguigno,
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
  public: {
    getDoctors: async () => {
      const response = await fetch(`${API_URL}/api/public/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctor');
      return response.json();
    },
    getAllergies: async () => {
      const response = await fetch(`${API_URL}/api/public/allergies`);
      if (!response.ok) throw new Error('Failed to fetch allergies');
      return response.json();
    },
    getAllergiesById: async (cf) => {
      const response = await fetch(`${API_URL}/api/public/allergies/${cf}`);
      if (!response.ok) throw new Error('Failed to fetch allergies');
      return response.json();
    },
    getDoctorAvailability: async (cf_dottore, startDate, endDate) => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      const response = await fetch(`${API_URL}/api/public/doctors/${cf_dottore}/availability?${params}`);
      if (!response.ok) throw new Error('Failed to fetch doctor availability');
      return response.json();
    },
    bookAppointment: async (appointmentData) => {
      // Transform fields to match new schema
      const transformedData = {
        doctorId: appointmentData.cf_dottore,
        patientId: appointmentData.cf_paziente,
        appointmentDateTime: appointmentData.appointmentDateTime + ':00Z',
        motivo: appointmentData.motivo
      };

      const response = await fetch(`${API_URL}/api/public/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      });
      if (!response.ok) throw new Error('Failed to book appointment');
      return response.json();
    },
    getPatientAppointments: async (patientId) => {
      const response = await fetch(`${API_URL}/api/public/patients/${patientId}/appointments`);
      if (!response.ok) throw new Error('Failed to fetch patient appointments');
      return response.json();
    },
    // New API functions for Surgeries and Post-Operative Protocols
    getPatientSurgeries: async (patientId) => {
      const response = await fetch(`${API_URL}/api/public/patients/${patientId}/surgeries`);
      if (!response.ok) throw new Error('Failed to fetch patient surgeries');
      return response.json();
    },
    getPostOperativeProtocols: async (surgeryId) => {
      const response = await fetch(`${API_URL}/api/public/surgeries/${surgeryId}/protocols`);
      if (!response.ok) throw new Error('Failed to fetch post-operative protocols');
      return response.json();
    },
    assignPostOperativeProtocols: async (surgeryId, protocols) => {
      const response = await fetch(`${API_URL}/api/public/surgeries/${surgeryId}/protocols`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocols),
      });
      if (!response.ok) throw new Error('Failed to assign post-operative protocols');
      return response.json();
    }
  },
  doctor: {
    setWeeklySchedule: async (scheduleData) => {
      // Transform fields to match new schema
      const transformedData = {
        cf_dottore: scheduleData.dottoreId,
        availabilities: scheduleData.availabilities.map(avail => ({
          giorno: avail.giornodellaSettimana.toLowerCase(),
          orainizio: avail.orainizio,
          orafine: avail.orafine
        }))
      };

      return api.protected.request(`/api/doctor/${scheduleData.dottoreId}/schedule`, {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    },
    getSchedule: async (cf_dottore, startDate, endDate) => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return api.protected.request(`/api/doctor/${cf_dottore}/schedule?${params}`);
    },
    updateVisitOutcome: async (id_visita, outcomeData) => {
      return api.protected.request(`/api/doctor/visits/${id_visita}/outcome`, {
        method: 'PATCH',
        body: JSON.stringify(outcomeData),
      });
    },
    scheduleSurgery: async (surgeryData) => {
      // Transform fields to match new schema
      return api.protected.request('/api/doctor/surgeries', {
        method: 'POST',
        body: JSON.stringify(surgeryData),
      });
    },
    getSurgeryTypes: async () => {
      return api.protected.request('/api/doctor/surgery-types');
    },
    getOperatingRooms: async () => {
      return api.protected.request('/api/doctor/operating-rooms');
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
