import { useState, useEffect } from 'react';
import { api } from '../../../api/api';

export const EquipmentTable = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [newEquipmentName, setNewEquipmentName] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await api.admin.getEquipment();
        setEquipment(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEquipment) {
        await api.admin.updateEquipment(editEquipment.id_attrezzatura, {
          nome: editEquipment.nome
        });
      } else {
        await api.admin.createEquipment({
          nome: newEquipmentName
        });
        setNewEquipmentName('');
      }
      setIsModalOpen(false);
      setEditEquipment(null);
      // Refresh data
      const data = await api.admin.getEquipment();
      setEquipment(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading equipment...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => {
            setEditEquipment(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Equipment
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {equipment.map((item) => (
            <tr key={item.id_attrezzatura}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id_attrezzatura}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => {
                    setEditEquipment(item);
                    setIsModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">
              {editEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editEquipment ? editEquipment.nome : newEquipmentName}
                    onChange={(e) => {
                      if (editEquipment) {
                        setEditEquipment({...editEquipment, nome: e.target.value});
                      } else {
                        setNewEquipmentName(e.target.value);
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditEquipment(null);
                    setNewEquipmentName('');
                  }}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editEquipment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
