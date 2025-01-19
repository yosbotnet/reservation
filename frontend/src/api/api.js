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
      // Transform fields to match new schema
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
  public: {
    getDoctors: async () => {
      const response = await fetch(`${API_URL}/api/public/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
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
    }
  },
  doctor: {
    setWeeklySchedule: async (scheduleData) => {
      // Transform fields to match new schema
      const transformedData = {
        cf_dottore: scheduleData.dottoreId,
        availabilities: scheduleData.availabilities.map(avail => ({
          giorno: avail.giorno.toLowerCase(),
          orainizio: avail.oraInizio,
          orafine: avail.oraFine
        }))
      };

      return api.protected.request('/api/doctors/schedule', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    },
    getSchedule: async (cf_dottore, startDate, endDate) => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return api.protected.request(`/api/doctors/${cf_dottore}/schedule?${params}`);
    },
    updateVisitOutcome: async (id_visita, outcomeData) => {
      return api.protected.request(`/api/doctors/visits/${id_visita}`, {
        method: 'PATCH',
        body: JSON.stringify(outcomeData),
      });
    },
    scheduleSurgery: async (surgeryData) => {
      // Transform fields to match new schema
      const transformedData = {
        cf_paziente: surgeryData.pazienteId,
        cf_dottore: surgeryData.dottoreId,
        id_tipo: surgeryData.tipoInterventoId,
        id_sala: surgeryData.salaOperatoriaId,
        dataoranizio: surgeryData.dataOraInizio,
        dataorafine: surgeryData.dataOraFine,
        note: surgeryData.note
      };

      return api.protected.request('/api/doctors/surgeries', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
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