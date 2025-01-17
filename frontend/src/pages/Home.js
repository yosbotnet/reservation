import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    switch (user.role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'DOCTOR':
        navigate('/doctor/dashboard');
        break;
      case 'PATIENT':
        navigate('/patient/dashboard');
        break;
      default:
        navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
};