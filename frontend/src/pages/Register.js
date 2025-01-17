import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    fiscalCode: '',
    birthDate: '',
    email: '',
    phone: '',
    bloodType: '',
    password: '',
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
  const severityLevels = ['BASSA', 'MEDIA', 'ALTA'];

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
        nome: formData.name,
        username: formData.email,
        cognome: formData.surname,
        codiceFiscale: formData.fiscalCode,
        dataNascita: formData.birthDate,
        email: formData.email,
        telefono: formData.phone,
        gruppoSanguigno: formData.bloodType,
        password: formData.password,
        ruolo: 'PAZIENTE',
        allergies: selectedAllergies.map(allergy => ({
          allergiaId: allergy.id,
          gravita: allergy.severity,
          note: allergy.notes
        }))
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
    setSelectedAllergies([...selectedAllergies, { id: '', severity: 'BASSA', notes: '' }]);
  };

  const handleAllergyRemove = (index) => {
    setSelectedAllergies(selectedAllergies.filter((_, i) => i !== index));
  };

  const handleAllergyChange = (index, field, value) => {
    const updatedAllergies = [...selectedAllergies];
    updatedAllergies[index] = { ...updatedAllergies[index], [field]: value };
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
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Surname</label>
            <input
              type="text"
              name="surname"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.surname}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fiscal Code</label>
            <input
              type="text"
              name="fiscalCode"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.fiscalCode}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Date</label>
            <input
              type="date"
              name="birthDate"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.birthDate}
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
              name="phone"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Type</label>
            <select
              name="bloodType"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.bloodType}
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
                  <div className="space-y-3">
                    <select
                      value={allergy.id}
                      onChange={(e) => handleAllergyChange(index, 'id', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select allergy</option>
                      {allergies.map(a => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                    <select
                      value={allergy.severity}
                      onChange={(e) => handleAllergyChange(index, 'severity', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {severityLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <textarea
                      value={allergy.notes}
                      onChange={(e) => handleAllergyChange(index, 'notes', e.target.value)}
                      placeholder="Additional notes"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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