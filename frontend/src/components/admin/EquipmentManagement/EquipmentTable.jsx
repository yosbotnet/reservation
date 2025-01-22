import { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import { format } from 'date-fns';

export const EquipmentTable = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);

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

  const handleSubmit = async (equipmentData) => {
    try {
      if (editEquipment) {
        const updatedEquipment = await api.admin.updateEquipment(
          editEquipment.codiceInventario,
          equipmentData
        );
        setEquipment(equipment.map(e =>
          e.codiceInventario === updatedEquipment.codiceInventario ? updatedEquipment : e
        ));
      } else {
        const newEquipment = await api.admin.createEquipment(equipmentData);
        setEquipment([...equipment, newEquipment]);
      }
      setIsModalOpen(false);
      setEditEquipment(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading equipment...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Maintenance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {equipment.map((item) => (
            <tr key={item.codiceInventario}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.codiceInventario}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.stato === 'DISPONIBILE'
                    ? 'bg-green-100 text-green-800'
                    : item.stato === 'IN_USO'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.stato}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.ultimaManutenzione ? format(new Date(item.ultimaManutenzione), 'dd/MM/yyyy') : 'Never'}
              </td>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">
              {editEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData);
              if (data.ultimaManutenzione) {
                data.ultimaManutenzione = new Date(data.ultimaManutenzione).toISOString();
              }
              handleSubmit(data);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Inventory Code</label>
                  <input
                    type="text"
                    name="codiceInventario"
                    defaultValue={editEquipment?.codiceInventario}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="nome"
                    defaultValue={editEquipment?.nome}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="stato"
                    defaultValue={editEquipment?.stato || 'DISPONIBILE'}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="DISPONIBILE">Available</option>
                    <option value="IN_USO">In Use</option>
                    <option value="MANUTENZIONE">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Maintenance Date</label>
                  <input
                    type="date"
                    name="ultimaManutenzione"
                    defaultValue={editEquipment?.ultimaManutenzione ? format(new Date(editEquipment.ultimaManutenzione), 'yyyy-MM-dd') : ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditEquipment(null);
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