import { LoadingSpinner } from '../LoadingSpinner';

export const Surgeries = ({
  surgeryForm,
  onSurgeryFormChange,
  onScheduleSurgery,
  surgeryTypes,
  operatingRooms,
  loading
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule Surgery</h2>
      
      <div className="max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Surgery Type</label>
            <select
              value={surgeryForm.id_tipo}
              onChange={(e) => onSurgeryFormChange({ ...surgeryForm, id_tipo: e.target.value })}
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
              onChange={(e) => onSurgeryFormChange({ ...surgeryForm, id_sala: e.target.value })}
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
              onChange={(e) => onSurgeryFormChange({ ...surgeryForm, dataoranizio: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date and Time</label>
            <input
              type="datetime-local"
              value={surgeryForm.dataorafine}
              onChange={(e) => onSurgeryFormChange({ ...surgeryForm, dataorafine: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={surgeryForm.note}
              onChange={(e) => onSurgeryFormChange({ ...surgeryForm, note: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={onScheduleSurgery}
              disabled={!surgeryForm.id_tipo || !surgeryForm.id_sala || !surgeryForm.dataoranizio || !surgeryForm.dataorafine}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Schedule Surgery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};