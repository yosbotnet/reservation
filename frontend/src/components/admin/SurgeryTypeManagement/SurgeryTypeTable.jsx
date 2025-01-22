import { useState, useEffect } from 'react';
import { api } from '../../../api/api';

export const SurgeryTypeTable = () => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProcedure, setEditProcedure] = useState(null);
  const [formState, setFormState] = useState({
    nome: '',
    descrizione: '',
    durataStimata: 60,
    complexity: 'MEDIA'
  });

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const data = await api.admin.getSurgeryTypes();
        setProcedures(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProcedures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProcedure) {
        await api.admin.updateSurgeryType(editProcedure.id, formState);
      } else {
        await api.admin.createSurgeryType(formState);
      }
      setIsModalOpen(false);
      setEditProcedure(null);
      // Refresh data
      const data = await api.admin.getSurgeryTypes();
      setProcedures(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (procedure) => {
    setEditProcedure(procedure);
    setFormState({
      nome: procedure.nome,
      descrizione: procedure.descrizione,
      durataStimata: procedure.durataStimata,
      complexity: procedure.complexity
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this procedure?')) {
      try {
        await api.admin.deleteSurgeryType(id);
        setProcedures(procedures.filter(p => p.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading procedures...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (min)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complexity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {procedures.map((procedure) => (
            <tr key={procedure.id}>
              <td className="px-6 py-4 whitespace-nowrap">{procedure.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap">{procedure.descrizione}</td>
              <td className="px-6 py-4 whitespace-nowrap">{procedure.durataStimata}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  procedure.complexity === 'BASSA' ? 'bg-green-100 text-green-800' :
                  procedure.complexity === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {procedure.complexity}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleEdit(procedure)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(procedure.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editProcedure ? 'Edit Procedure' : 'New Procedure'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formState.nome}
                    onChange={(e) => setFormState({...formState, nome: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formState.descrizione}
                    onChange={(e) => setFormState({...formState, descrizione: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formState.durataStimata}
                    onChange={(e) => setFormState({...formState, durataStimata: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min="15"
                    step="15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Complexity</label>
                  <select
                    value={formState.complexity}
                    onChange={(e) => setFormState({...formState, complexity: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="BASSA">Low</option>
                    <option value="MEDIA">Medium</option>
                    <option value="ALTA">High</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditProcedure(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700"
                >
                  {editProcedure ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};