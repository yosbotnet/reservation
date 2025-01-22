import { 
  PieChart, Pie, Cell, Tooltip, Legend 
} from 'recharts';

export const ProcedurePieChart = ({ data }) => {
  const transformData = (data) => 
    data?.map(proc => ({
      name: `Procedure ${proc.id_tipo}`,
      value: proc._count
    })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Procedure Statistics</h3>
      <PieChart width={500} height={300}>
        <Pie
          data={transformData(data)}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {transformData(data).map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};