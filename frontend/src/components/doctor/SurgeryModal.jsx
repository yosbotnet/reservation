import { useState } from 'react';

export const SurgeryModal = ({ surgery, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    esito: surgery.esito,
    dataoranizio: surgery.dataoranizio.slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    dataorafine: surgery.dataorafine.slice(0, 16)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(surgery.id_intervento, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full" style={{ zIndex: 10000 }}>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Update Surgery Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.esito}
              onChange={(e) => setFormData({ ...formData, esito: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="programmato">Programmato</option>
              <option value="in_corso">In Corso</option>
              <option value="completato">Completato</option>
              <option value="annullato">Annullato</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date and Time</label>
            <input
              type="datetime-local"
              value={formData.dataoranizio}
              onChange={(e) => setFormData({ ...formData, dataoranizio: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date and Time</label>
            <input
              type="datetime-local"
              value={formData.dataorafine}
              onChange={(e) => setFormData({ ...formData, dataorafine: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
