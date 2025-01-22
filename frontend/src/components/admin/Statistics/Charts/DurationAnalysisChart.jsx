import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export const DurationAnalysisChart = ({ data }) => {
  const transformData = (data) => 
    data?.map(item => ({
      name: `Case ${item.id}`,
      Estimated: item.estimatedDuration,
      Actual: item.actualDuration
    })) || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Surgery Duration Analysis</h3>
      <BarChart width={500} height={300} data={transformData(data)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Estimated" fill="#82ca9d" />
        <Bar dataKey="Actual" fill="#8884d8" />
      </BarChart>
    </div>
  );
};