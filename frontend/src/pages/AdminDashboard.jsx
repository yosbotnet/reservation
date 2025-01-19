import { useState, useEffect,useCallback } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';
export const AdminDashboard = () => {
    return (<div className="flex justify-center items-center h-64">
    <div className="text-gray-600">Doctor Dashboard (Coming Sooner)</div>
  </div>);
}