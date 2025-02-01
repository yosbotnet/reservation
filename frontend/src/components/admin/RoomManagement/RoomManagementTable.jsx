import { useState, useEffect } from 'react';
import { api } from '../../../api/api.js';

export const RoomManagementTable = () => {
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [newRoomData, setNewRoomData] = useState({
    nome: '',
    attrezzature: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, equipmentData] = await Promise.all([
          api.admin.getRooms(),
          api.admin.getEquipment()
        ]);
        setRooms(roomsData);
        setEquipment(equipmentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRoom) {
        await api.admin.updateRoom(editRoom.id_sala, {
          nome: editRoom.nome,
          attrezzature: editRoom.attrezzature || []
        });
      } else {
        await api.admin.createRoom({
          nome: newRoomData.nome,
          attrezzature: newRoomData.attrezzature
        });
      }
      setIsModalOpen(false);
      setEditRoom(null);
      // Refresh data
      const data = await api.admin.getRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading operating rooms...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => {
            setEditRoom(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Room
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map((room) => (
            <tr key={room.id_sala}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.id_sala}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {room.attrezzatureFisse?.join(', ') || 'None'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => {
                    setEditRoom(room);
                    setIsModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">
              {editRoom ? 'Edit Operating Room' : 'Add New Operating Room'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
                  <input
                    type="text"
                    value={editRoom ? editRoom.nome : newRoomData.nome}
                    onChange={(e) => {
                      if (editRoom) {
                        setEditRoom({...editRoom, nome: e.target.value});
                      } else {
                        setNewRoomData({...newRoomData, nome: e.target.value});
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment (Hold Ctrl/Cmd to select multiple)
                  </label>
                  <div className="relative">
                    <select
                      multiple
                      value={editRoom ? editRoom.attrezzature || [] : newRoomData.attrezzature}
                      onChange={(e) => {
                        const selectedEquipment = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        if (editRoom) {
                          setEditRoom({...editRoom, attrezzature: selectedEquipment});
                        } else {
                          setNewRoomData({...newRoomData, attrezzature: selectedEquipment});
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[120px]"
                      size="6"
                    >
                      {equipment.map((item) => (
                        <option key={item.id_attrezzatura} value={item.id_attrezzatura}>
                          {item.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Selected: {(editRoom ? editRoom.attrezzature : newRoomData.attrezzature)?.length || 0} items
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditRoom(null);
                    setNewRoomData({nome: '', attrezzature: []});
                  }}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editRoom ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
