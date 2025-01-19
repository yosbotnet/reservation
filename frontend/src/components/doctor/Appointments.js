import { LoadingSpinner } from '../LoadingSpinner';

export const Appointments = ({
  appointments,
  selectedAppointment,
  onAppointmentSelect,
  onUpdateOutcome,
  onScheduleSurgery,
  loading,
  updatingOutcome,
  setUpdatingOutcome,
  newOutcome,
  setNewOutcome
}) => {
  if (loading) {
    return (
      <div className="h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
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
                onClick={() => onAppointmentSelect(appointment)}
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
                            onClick={onScheduleSurgery}
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
                              onClick={onUpdateOutcome}
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
  );
};