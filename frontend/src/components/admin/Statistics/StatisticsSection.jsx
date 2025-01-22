import { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import { subMonths, format } from 'date-fns';
import { RoomOccupancyChart } from './Charts/RoomOccupancyChart';
import { DurationAnalysisChart } from './Charts/DurationAnalysisChart';
import { DoctorPerformanceChart } from './Charts/DoctorPerformanceChart';
import { ProcedurePieChart } from './Charts/ProcedurePieChart';

export const StatisticsSection = () => {
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 3),
    endDate: new Date()
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.admin.getStatistics(dateRange.startDate, dateRange.endDate);
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    fetchStats();
  }, [dateRange]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Statistics</h2>
        <div className="flex gap-4">
          <input
            type="date"
            value={format(dateRange.startDate, 'yyyy-MM-dd')}
            onChange={(e) => setDateRange(prev => ({...prev, startDate: new Date(e.target.value)}))}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={format(dateRange.endDate, 'yyyy-MM-dd')}
            onChange={(e) => setDateRange(prev => ({...prev, endDate: new Date(e.target.value)}))}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoomOccupancyChart data={stats?.roomOccupancy} />
        <DurationAnalysisChart data={stats?.surgeryDurations} />
        <DoctorPerformanceChart data={stats?.doctorSuccess} />
        <ProcedurePieChart data={stats?.yearlyStats} />
      </div>
    </div>
  );
};