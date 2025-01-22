import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export const DoctorPerformanceChart = ({ data }) => {
  const transformData = (data) => 
    data?.map(doctor => ({
      name: `Doctor ${doctor.dottoreId}`,
      Successes: doctor._count.successo
    })) || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Doctor Performance</h3>
      <BarChart width={500} height={300} data={transformData(data)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Successes" fill="#ffc658" />
      </BarChart>
    </div>
  );
};