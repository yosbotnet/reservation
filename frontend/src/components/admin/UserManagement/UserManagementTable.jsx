import { useState, useEffect } from 'react';
import { api } from '../../../api/api';

const INITIAL_DOCTOR_FORM = {
  username: '',
  password: '',
  nome: '',
  cognome: '',
  cf: '',
  datanascita: '',
  telefono: '',
  numeroregistrazione: '',
  iban: '',
  specializzazioni: []
};

export const UserManagementTable = () => {
  const [allUsers, setAllUsers] = useState([]); // Store original list
  const [filteredUsers, setFilteredUsers] = useState([]); // Store filtered view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [doctorForm, setDoctorForm] = useState(INITIAL_DOCTOR_FORM);
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, specializationsData] = await Promise.all([
          api.admin.getUsers(),
          api.admin.getSpecializations()
        ]);
        setAllUsers(userData);
        setFilteredUsers(userData);
        setSpecializations(specializationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (cf) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.admin.deleteUser(cf);
        setAllUsers(prev => prev.filter(user => user.cf !== cf));
        setFilteredUsers(prev => prev.filter(user => user.cf !== cf));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      const newDoctor = await api.admin.createDoctor({
        ...doctorForm,
        tipoutente: 'dottore',
        datanascita: new Date(doctorForm.datanascita).toISOString()
      });
      setAllUsers(prev => [...prev, newDoctor]);
      setFilteredUsers(prev => [...prev, newDoctor]);
      setShowDoctorForm(false);
      setDoctorForm(INITIAL_DOCTOR_FORM);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSpecializationChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setDoctorForm(prev => ({
      ...prev,
      specializzazioni: value
    }));
  };

  if (loading) return <div className="p-4">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setShowDoctorForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Doctor
        </button>
        <select 
          onChange={(e) => {
            const role = e.target.value;
            if (role === 'all') {
              setFilteredUsers(allUsers);
            } else {
              setFilteredUsers(allUsers.filter(user => user.tipoutente === role));
            }
          }}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Users</option>
          <option value="dottore">Doctors</option>
          <option value="paziente">Patients</option>
        </select>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <tr key={user.cf}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.tipoutente}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nome} {user.cognome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.tipoutente === 'dottore' && (
                  <span>Reg. No: {user.numeroregistrazione}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => handleDelete(user.cf)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDoctorForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add New Doctor</h3>
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={doctorForm.username}
                    onChange={(e) => setDoctorForm({...doctorForm, username: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={doctorForm.nome}
                    onChange={(e) => setDoctorForm({...doctorForm, nome: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={doctorForm.cognome}
                    onChange={(e) => setDoctorForm({...doctorForm, cognome: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fiscal Code</label>
                  <input
                    type="text"
                    value={doctorForm.cf}
                    onChange={(e) => setDoctorForm({...doctorForm, cf: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                  <input
                    type="date"
                    value={doctorForm.datanascita}
                    onChange={(e) => setDoctorForm({...doctorForm, datanascita: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={doctorForm.telefono}
                    onChange={(e) => setDoctorForm({...doctorForm, telefono: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text"
                    value={doctorForm.numeroregistrazione}
                    onChange={(e) => setDoctorForm({...doctorForm, numeroregistrazione: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IBAN</label>
                  <input
                    type="text"
                    value={doctorForm.iban}
                    onChange={(e) => setDoctorForm({...doctorForm, iban: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Specializations</label>
                  <select
                    multiple
                    value={doctorForm.specializzazioni}
                    onChange={handleSpecializationChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    size="4"
                  >
                    {specializations.map(spec => (
                      <option key={spec.id_specializzazione} value={spec.id_specializzazione}>
                        {spec.nome}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDoctorForm(false);
                    setDoctorForm(INITIAL_DOCTOR_FORM);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
