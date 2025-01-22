import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export const RoomOccupancyChart = ({ data }) => {
  const transformData = (data) => 
    data?.map(room => ({
      name: `Room ${room.salaOperatoriaId}`,
      Occupancy: room._count
    })) || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Room Occupancy</h3>
      <LineChart width={500} height={300} data={transformData(data)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Occupancy" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};