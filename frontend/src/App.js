import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { PatientDashboard } from './pages/PatientDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Role-specific route components
const AdminRoute = ({ children }) => (
  <ProtectedRoute roles={['ADMIN']}>{children}</ProtectedRoute>
);

const DoctorRoute = ({ children }) => (
  <ProtectedRoute roles={['DOCTOR']}>{children}</ProtectedRoute>
);

const PatientRoute = ({ children }) => (
  <ProtectedRoute roles={['PATIENT']}>{children}</ProtectedRoute>
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
