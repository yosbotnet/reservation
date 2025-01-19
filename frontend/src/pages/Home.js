import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user, isAdmin, isPatient, isDoctor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if(isAdmin()) {
      navigate('/admin/dashboard');
      return;
    }
    if(isDoctor()) {
      navigate('/doctor/dashboard');
      return;
    }
    if(isPatient()) {
      navigate('/patient/dashboard');
      return;
    }
    navigate('/login');
    }, [user, navigate, isAdmin, isDoctor, isPatient]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
};