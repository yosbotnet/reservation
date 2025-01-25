import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    nome: '',
    cognome: '',
    cf: '',
    datanascita: '',
    email: '',
    telefono: '',
    grupposanguigno: '',
    password: '',
    tipoutente: 'paziente',
    confirmPassword: ''
  });
  const [allergies, setAllergies] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const bloodTypes = [
    { value: 'A_', label: 'A+' },
    { value: 'A_MINUS', label: 'A-' },
    { value: 'B_', label: 'B+' },
    { value: 'B_MINUS', label: 'B-' },
    { value: 'AB_', label: 'AB+' },
    { value: 'AB_MINUS', label: 'AB-' },
    { value: 'ZERO_', label: 'O+' },
    { value: 'ZERO_MINUS', label: 'O-' }
  ];

  useEffect(() => {
    loadAllergies();
  }, []);

  const loadAllergies = async () => {
    try {
      const response = await api.public.getAllergies();
      setAllergies(response);
    } catch (err) {
      setError('Failed to load allergies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const registrationData = {
        username: formData.username,
        password: formData.password,
        tipoutente: 'paziente',
        email: formData.email,
        nome: formData.nome,
        cognome: formData.cognome,
        cf: formData.cf,
        datanascita: formData.datanascita,
        telefono: formData.telefono,
        grupposanguigno: formData.grupposanguigno,
        allergie: selectedAllergies.map(allergy => allergy.nome)
      };
      await api.auth.register(registrationData);
      navigate('/login', { state: { message: 'Registration successful. Please login.' } });
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllergyAdd = () => {
    setSelectedAllergies([...selectedAllergies, { nome: '' }]);
  };

  const handleAllergyRemove = (index) => {
    setSelectedAllergies(selectedAllergies.filter((_, i) => i !== index));
  };

  const handleAllergyChange = (index, nome) => {
    const updatedAllergies = [...selectedAllergies];
    updatedAllergies[index] = { nome };
    setSelectedAllergies(updatedAllergies);
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Patient Registration
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="nome"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.nome}
              onChange={handleChange}
            />
          </div>

          {/* Rest of the form fields remain the same */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Surname</label>
            <input
              type="text"
              name="cognome"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.cognome}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fiscal Code</label>
            <input
              type="text"
              name="cf"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.cf}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Date</label>
            <input
              type="date"
              name="datanascita"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.datanascita}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="telefono"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Type</label>
            <select
              name="grupposanguigno"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.grupposanguigno}
              onChange={handleChange}
            >
              <option value="">Select blood type</option>
              {bloodTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Allergies</label>
              <button
                type="button"
                onClick={handleAllergyAdd}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
              >
                Add Allergy
              </button>
            </div>
            <div className="space-y-4">
              {selectedAllergies.map((allergy, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium">Allergy #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleAllergyRemove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  <select
                    value={allergy.nome}
                    onChange={(e) => handleAllergyChange(index, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select allergy</option>
                    {allergies.map(a => (
                      <option key={a.nome} value={a.nome}>{a.nome}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};