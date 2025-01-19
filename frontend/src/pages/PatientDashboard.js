import { useState, useEffect,useCallback } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [appointmentReason, setAppointmentReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {user} = useAuth();

  useEffect(() => {
    loadDoctors();
  }, []);
  const loadDoctorAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 1);

      const availability = await api.public.getDoctorAvailability(
        selectedDoctor,
        startDate,
        endDate
      );

      // Process weekly schedule and existing appointments to determine available times
      const dayOfWeek = startDate.getDay();
      const daySchedule = availability.weeklySchedule.find(
        schedule => schedule.giornodellaSettimana.toLowerCase() === 
          ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'][dayOfWeek]
      );

      if (!daySchedule) {
        setAvailableTimes([]);
        return;
      }

      // Generate 30-minute slots between start and end time
      const times = [];
      //orainizio e orafine vengono interpretati dall'orm come datetime invece di time, non so perche
      // Get time in HH:MM:SS format
      const orainizio = daySchedule.orainizio.split('T')[1];

      // Get time in 24-hour format with milliseconds
      const orafine =daySchedule.orafine.split('T')[1];;
      let currentTime = new Date(`${selectedDate}T${orainizio}`);
      const endTime = new Date(`${selectedDate}T${orafine}`);

      while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5);
        const dateTimeString = `${selectedDate}T${timeString}`;

        // Check if this time slot conflicts with any existing appointments
        const isBooked = availability.appointments.visits.some(visit => 
          new Date(visit.dataora).toISOString() === new Date(dateTimeString).toISOString()
        ) || availability.appointments.surgeries.some(surgery => {
          const surgeryStart = new Date(surgery.dataoranizio);
          const surgeryEnd = new Date(surgery.dataorafine);
          const slotTime = new Date(dateTimeString);
          return slotTime >= surgeryStart && slotTime < surgeryEnd;
        });

        if (!isBooked) {
          times.push(timeString);
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      setAvailableTimes(times);
    } catch (err) {
      setError('Failed to load doctor availability');
    } finally {
      setLoading(false);
    }
  },[selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadDoctorAvailability();
    }
  }, [selectedDoctor, selectedDate, loadDoctorAvailability]);
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
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !appointmentReason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const appointmentDateTime = `${selectedDate}T${selectedTime}`;
      await api.public.bookAppointment({
        cf_dottore: selectedDoctor,
        cf_paziente: user.cf, // Replace with actual patient ID
        appointmentDateTime,
        motivo: appointmentReason
      });

      // Reset form
      setSelectedTime('');
      setAppointmentReason('');
      setError('');
      alert('Appointment booked successfully!');
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
              key={doctor.cf}
              onClick={() => setSelectedDoctor(doctor.cf)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedDoctor === doctor.cf
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-500'
              }`}
            >
              <div className="font-medium">{`${doctor.nome} ${doctor.cognome}`}</div>
              <div className="text-sm text-gray-500">
                {doctor.specializzazioni.join(', ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Date and Time</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {selectedDate && availableTimes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">Select a time</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedTime && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <textarea
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  rows={3}
                />
              </div>
            )}

            {selectedTime && appointmentReason && (
              <button
                onClick={handleBookAppointment}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Book Appointment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};