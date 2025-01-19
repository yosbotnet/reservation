import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

const DAYS = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatingOutcome, setUpdatingOutcome] = useState(false);
  const [newOutcome, setNewOutcome] = useState('');
  const [surgeryForm, setSurgeryForm] = useState({
    id_tipo: '',
    id_sala: '',
    dataoranizio: '',
    dataorafine: '',
    note: ''
  });
  const [surgeryTypes, setSurgeryTypes] = useState([]);
  const [operatingRooms, setOperatingRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [tempSchedule, setTempSchedule] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadDoctorSchedule();
    } else if (activeTab === 'appointments') {
      loadAppointments();
    } else if (activeTab === 'surgeries') {
      loadSurgeryTypes();
      loadOperatingRooms();
    }
  }, [activeTab]);

  const loadDoctorSchedule = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await api.doctor.getSchedule(user.cf, startDate, endDate);
      const weeklySchedule = response.weeklySchedule || [];
      setSchedule(weeklySchedule);
      setTempSchedule(weeklySchedule);
    } catch (err) {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Load next 30 days

      const response = await api.doctor.getSchedule(user.cf, startDate, endDate);
      const visits = response.visits || [];
      
      // Sort appointments by date
      const sortedAppointments = visits.sort((a, b) => 
        new Date(a.dataora) - new Date(b.dataora)
      );
      
      setAppointments(sortedAppointments);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadSurgeryTypes = async () => {
    try {
      const response = await api.protected.request('/api/doctor/surgery-types');
      setSurgeryTypes(response);
    } catch (err) {
      setError('Failed to load surgery types');
    }
  };

  const loadOperatingRooms = async () => {
    try {
      const response = await api.protected.request('/api/doctor/operating-rooms');
      setOperatingRooms(response);
    } catch (err) {
      setError('Failed to load operating rooms');
    }
  };

  const handleUpdateOutcome = async () => {
    try {
      setLoading(true);
      await api.doctor.updateVisitOutcome(selectedAppointment.id_visita, {
        motivo: newOutcome
      });
      
      // Refresh appointments
      await loadAppointments();
      setUpdatingOutcome(false);
      setNewOutcome('');
    } catch (err) {
      setError('Failed to update visit outcome');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSurgery = async () => {
    try {
      if(!selectedAppointment) {
        setError('Please select an appointment to schedule surgery');
        return;
      }
      setLoading(true);
      await api.doctor.scheduleSurgery({
        ...surgeryForm,
        cf_paziente: selectedAppointment.paziente.cf,
        cf_dottore: user.cf
      });
      
      // Reset form and refresh
      setSurgeryForm({
        id_tipo: '',
        id_sala: '',
        dataoranizio: '',
        dataorafine: '',
        note: ''
      });
      alert('Surgery scheduled successfully!');
    } catch (err) {
      setError('Failed to schedule surgery');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      await api.doctor.setWeeklySchedule({
        dottoreId: user.cf,
        availabilities: tempSchedule
      });
      setSchedule(tempSchedule);
      setEditingSchedule(false);
    } catch (err) {
      setError('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotToggle = (day, time) => {
    if (!editingSchedule) return;

    const existingSlot = tempSchedule.find(
      slot => slot.giornodellaSettimana === day && 
      slot.orainizio.includes(time)
    );

    if (existingSlot) {
      setTempSchedule(tempSchedule.filter(slot => slot !== existingSlot));
    } else {
      // Add new 1-hour slot
      const endTime = `${(parseInt(time) + 1).toString().padStart(2, '0')}:00:00`;
      setTempSchedule([
        ...tempSchedule,
        {
          giornodellaSettimana: day,
          orainizio: time + ':00',
          orafine: endTime
        }
      ]);
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['schedule', 'appointments', 'surgeries'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Weekly Schedule</h2>
            <div className="space-x-2">
              {editingSchedule ? (
                <>
                  <button
                    onClick={handleSaveSchedule}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setTempSchedule(schedule);
                      setEditingSchedule(false);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingSchedule(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit Schedule
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  {DAYS.map(day => (
                    <th
                      key={day}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {TIME_SLOTS.map(time => (
                  <tr key={time}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {time}
                    </td>
                    {DAYS.map(day => {
                      const isAvailable = (editingSchedule ? tempSchedule : schedule).some(
                        slot => 
                          slot.giornodellaSettimana === day &&
                          slot.orainizio.includes(time)
                      );
                      return (
                        <td
                          key={`${day}-${time}`}
                          onClick={() => handleTimeSlotToggle(day, time)}
                          className={`
                            px-6 py-4 whitespace-nowrap text-sm
                            ${editingSchedule ? 'cursor-pointer hover:bg-gray-100' : ''}
                            ${isAvailable ? 'bg-green-100' : ''}
                          `}
                        >
                          {isAvailable && '✓'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appointments</h2>
          
          {appointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id_visita}
                    onClick={() => setSelectedAppointment(appointment)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-colors
                      ${selectedAppointment?.id_visita === appointment.id_visita
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-500'}
                    `}
                  >
                    <div className="font-medium">
                      {new Date(appointment.dataora).toLocaleDateString()} at{' '}
                      {new Date(appointment.dataora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      Patient: {appointment.paziente.nome} {appointment.paziente.cognome}
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2">
                {selectedAppointment ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date and Time</h4>
                        <p className="mt-1">
                          {new Date(selectedAppointment.dataora).toLocaleDateString()}{' '}
                          {new Date(selectedAppointment.dataora).toLocaleTimeString()}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Patient Information</h4>
                        <p className="mt-1">
                          {selectedAppointment.paziente.nome} {selectedAppointment.paziente.cognome}
                        </p>
                        <p className="text-sm text-gray-500">
                          Blood Type: {selectedAppointment.paziente.grupposanguigno}
                        </p>
                        {selectedAppointment.paziente.allergie?.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Allergies: {selectedAppointment.paziente.allergie.join(', ')}
                          </p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Reason for Visit</h4>
                        <p className="mt-1">{selectedAppointment.motivo}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Actions</h4>
                        <div className="mt-2">
                          {!updatingOutcome ? (
                            <div className="space-x-2">
                              <button
                                onClick={() => setUpdatingOutcome(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              >
                                Update Visit Outcome
                              </button>
                              <button
                                onClick={() => setActiveTab('surgeries')}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                              >
                                Schedule Surgery
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <textarea
                                value={newOutcome}
                                onChange={(e) => setNewOutcome(e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                rows={3}
                                placeholder="Enter visit outcome..."
                              />
                              <div className="space-x-2">
                                <button
                                  onClick={handleUpdateOutcome}
                                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                  Save Outcome
                                </button>
                                <button
                                  onClick={() => {
                                    setUpdatingOutcome(false);
                                    setNewOutcome('');
                                  }}
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                    Select an appointment to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'surgeries' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule Surgery</h2>
          
          <div className="max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Surgery Type</label>
                <select
                  value={surgeryForm.id_tipo}
                  onChange={(e) => setSurgeryForm({ ...surgeryForm, id_tipo: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">Select a surgery type</option>
                  {surgeryTypes.map((type) => (
                    <option key={type.id_tipo} value={type.id_tipo}>
                      {type.nome} - Complexity: {type.complessita}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Operating Room</label>
                <select
                  value={surgeryForm.id_sala}
                  onChange={(e) => setSurgeryForm({ ...surgeryForm, id_sala: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">Select an operating room</option>
                  {operatingRooms.map((room) => (
                    <option key={room.id_sala} value={room.id_sala}>
                      {room.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date and Time</label>
                <input
                  type="datetime-local"
                  value={surgeryForm.dataoranizio}
                  onChange={(e) => setSurgeryForm({ ...surgeryForm, dataoranizio: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date and Time</label>
                <input
                  type="datetime-local"
                  value={surgeryForm.dataorafine}
                  onChange={(e) => setSurgeryForm({ ...surgeryForm, dataorafine: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={surgeryForm.note}
                  onChange={(e) => setSurgeryForm({ ...surgeryForm, note: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleScheduleSurgery}
                  disabled={!surgeryForm.id_tipo || !surgeryForm.id_sala || !surgeryForm.dataoranizio || !surgeryForm.dataorafine}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Schedule Surgery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};