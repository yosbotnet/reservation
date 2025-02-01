import { useState, useEffect } from 'react';
import { formatTime } from '../../utils/timeutils';

const DAYS = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];

export const WorkHours = ({ isOpen, onClose, schedule, onSave }) => {
  const [workHours, setWorkHours] = useState([]);

  useEffect(() => {
    if (schedule) {
      const initialHours = DAYS.map(day => {
        const daySchedule = schedule.find(s => s.giornodellasettimana === day);
        return {
          day,
          enabled: !!daySchedule,
          start: daySchedule ? formatTime(daySchedule.orainizio) : '09:00',
          end: daySchedule ? formatTime(daySchedule.orafine) : '17:00'
        };
      });
      setWorkHours(initialHours);
    }
  }, [schedule]);

  const handleSave = () => {
    const newSchedule = workHours
      .filter(hours => hours.enabled)
      .map(hours => ({
        giornodellasettimana: hours.day,
        orainizio: hours.start + ':00',
        orafine: hours.end + ':00'
      }));
    onSave(newSchedule);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Set Work Hours</h3>
          
          {workHours.map((hours, index) => (
            <div key={hours.day} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => {
                      const newHours = [...workHours];
                      newHours[index] = {
                        ...hours,
                        enabled: e.target.checked
                      };
                      setWorkHours(newHours);
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 capitalize">{hours.day}</span>
                </label>
                {hours.enabled && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => {
                        const newHours = [...workHours];
                        newHours[index] = {
                          ...hours,
                          start: e.target.value
                        };
                        setWorkHours(newHours);
                      }}
                      className="form-input px-2 py-1 border rounded"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => {
                        const newHours = [...workHours];
                        newHours[index] = {
                          ...hours,
                          end: e.target.value
                        };
                        setWorkHours(newHours);
                      }}
                      className="form-input px-2 py-1 border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};