import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../api/api';

export const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadAvailableSlots(selectedDoctor);
    }
  }, [selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const data = await api.public.getDoctors();
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (doctorId) => {
    try {
      setLoading(true);
      const slots = await api.public.getAvailableSlots(doctorId);
      setAvailableSlots(slots);
    } catch (err) {
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (slotId) => {
    try {
      await api.protected.request('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({ slotId }),
      });
      // Refresh available slots
      loadAvailableSlots(selectedDoctor);
    } catch (err) {
      setError('Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Doctor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => setSelectedDoctor(doctor.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedDoctor === doctor.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-500'
              }`}
            >
              <div className="font-medium">{doctor.name}</div>
              <div className="text-sm text-gray-500">{doctor.specialization}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Available Slots</h2>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="font-medium">
                    {new Date(slot.startTime).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(slot.startTime).toLocaleTimeString()} -{' '}
                    {new Date(slot.endTime).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() => handleBookAppointment(slot.id)}
                    className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No available slots</div>
          )}
        </div>
      )}
    </div>
  );
};