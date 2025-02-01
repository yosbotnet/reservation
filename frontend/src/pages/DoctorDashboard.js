import { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';
import { Schedule } from '../components/doctor/Schedule';
import { Appointments } from '../components/doctor/Appointments';
import { Surgeries } from '../components/doctor/Surgeries';

export const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedule, setSchedule] = useState([]);
  const [workHours, setWorkHours] = useState([]);
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
  const { user } = useAuth();



  const loadDoctorSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const response = await api.doctor.getSchedule(user.cf, startDate, endDate);
      
      // Set work hours
      setWorkHours(response.weeklySchedule || []);

      // Transform visits and surgeries into FullCalendar events
      const events = [
        ...(response.visits || []).map(visit => ({
          id: `visit-${visit.id_visita}`,
          title: `Visit: ${visit.paziente.nome} ${visit.paziente.cognome}`,
          start: new Date(visit.dataora),
          end: new Date(new Date(visit.dataora).getTime() + 30 * 60000), // 30 minutes duration
          backgroundColor: '#4299e1', // blue
          extendedProps: {
            type: 'visit',
            ...visit
          }
        })),
        ...(response.surgeries || []).map(surgery => ({
          id: `surgery-${surgery.id_intervento}`,
          title: `Surgery: ${surgery.paziente.nome} ${surgery.paziente.cognome}`,
          start: new Date(surgery.dataoranizio),
          end: new Date(surgery.dataorafine),
          backgroundColor: '#48bb78', // green
          extendedProps: {
            type: 'surgery',
            ...surgery
          }
        }))
      ];

      setSchedule(events);
    } catch (err) {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [user.cf]);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const response = await api.doctor.getSchedule(user.cf, startDate, endDate);
      const visits = response.visits || [];
      
      const sortedAppointments = visits.sort((a, b) => 
        new Date(a.dataora) - new Date(b.dataora)
      );
      
      setAppointments(sortedAppointments);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [user.cf]);

  const loadSurgeryTypes = async () => {
    try {
      const response = await api.doctor.getSurgeryTypes();
      setSurgeryTypes(response);
    } catch (err) {
      setError('Failed to load surgery types');
    }
  };

  const loadOperatingRooms = async () => {
    try {
      const response = await api.doctor.getOperatingRooms();
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
      setLoading(true);
      await api.doctor.scheduleSurgery({
        ...surgeryForm,
        cf_paziente: selectedAppointment.paziente.cf,
        cf_dottore: user.cf
      });
      
      setSurgeryForm({
        id_tipo: '',
        id_sala: '',
        dataoranizio: '',
        dataorafine: '',
        note: ''
      });
      alert('Surgery scheduled successfully!');
      loadDoctorSchedule();
    } catch (err) {
      setError('Failed to schedule surgery');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (appointment) => {
    setSelectedAppointment(appointment);
    setActiveTab('appointments');
  };

  const handleWorkHoursUpdate = async (newSchedule) => {
    try {
      setLoading(true);
      await api.doctor.setWeeklySchedule({
        dottoreId: user.cf,
        availabilities: newSchedule
      });
      setWorkHours(newSchedule);
      await loadDoctorSchedule(); // Reload schedule to reflect changes
    } catch (err) {
      setError('Failed to update work hours');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      if (activeTab === 'schedule') {
        await loadDoctorSchedule();
      } else if (activeTab === 'appointments') {
        await loadAppointments();
      } else if (activeTab === 'surgeries') {
        await Promise.all([loadSurgeryTypes(), loadOperatingRooms()]);
      }
    };
    loadData();
  }, [activeTab, loadAppointments, loadDoctorSchedule]);
  if (loading && !activeTab) {
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
        <Schedule
          schedule={schedule}
          onEventClick={handleEventClick}
          workHours={workHours}
          onWorkHoursUpdate={handleWorkHoursUpdate}
          loading={loading}
        />
      )}

      {activeTab === 'appointments' && (
        <Appointments
          appointments={appointments}
          selectedAppointment={selectedAppointment}
          onAppointmentSelect={setSelectedAppointment}
          onUpdateOutcome={handleUpdateOutcome}
          onScheduleSurgery={() => setActiveTab('surgeries')}
          loading={loading}
          updatingOutcome={updatingOutcome}
          setUpdatingOutcome={setUpdatingOutcome}
          newOutcome={newOutcome}
          setNewOutcome={setNewOutcome}
        />
      )}

      {activeTab === 'surgeries' && (
        <Surgeries
          surgeryForm={surgeryForm}
          onSurgeryFormChange={setSurgeryForm}
          onScheduleSurgery={handleScheduleSurgery}
          surgeryTypes={surgeryTypes}
          operatingRooms={operatingRooms}
          loading={loading}
        />
      )}
    </div>
  );
};
