import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { PatientDashboard } from './pages/PatientDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, lock }) => {
  const { user, isAdmin, isPatient, isDoctor } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (lock) {
    switch (lock){
      case 'admin':
        if (isAdmin()) {
          return children;
        }
        break;
      case 'dottore':
        if (isDoctor()) {
          return children;
        }
        break;
      case 'paziente':
        if (isPatient()) {
          return children;
        }
        break;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

// Role-specific route components
const AdminRoute = ({ children }) => (
  <ProtectedRoute roles={['admin']}>{children}</ProtectedRoute>
);

const DoctorRoute = ({ children }) => (
  <ProtectedRoute roles={'dottore'}>{children}</ProtectedRoute>
);

const PatientRoute = ({ children }) => (
  <ProtectedRoute roles={['paziente']}>{children}</ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            
            {/* Patient Routes */}
            <Route 
              path="/patient/dashboard" 
              element={
                <PatientRoute>
                  <PatientDashboard />
                </PatientRoute>
              } 
            />

            {/* Doctor Routes - To be implemented */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <DoctorRoute>
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">Doctor Dashboard (Coming Soon)</div>
                  </div>
                </DoctorRoute>
              } 
            />

            {/* Admin Routes - To be implemented */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">Admin Dashboard (Coming Soon)</div>
                  </div>
                </AdminRoute>
              } 
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
