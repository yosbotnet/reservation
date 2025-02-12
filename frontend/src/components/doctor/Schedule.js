import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { WorkHours } from './WorkHours';
import { dbScheduleToBusinessHours } from '../../utils/timeutils';

export const Schedule = ({ 
  schedule, 
  onEventClick, 
  workHours,
  onWorkHoursUpdate,
  loading 
}) => {
  const [showWorkHours, setShowWorkHours] = useState(false);

  const handleEventClick = (info) => {
    const { extendedProps } = info.event;
    if (extendedProps.type === 'visit') {
      onEventClick(extendedProps);
    }
  };

  const businessHours = dbScheduleToBusinessHours(workHours);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Schedule</h2>
        <button
          onClick={() => setShowWorkHours(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Set Work Hours
        </button>
      </div>

      <div className="h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={schedule}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          height="100%"
          locale="it"
          firstDay={1}
          businessHours={businessHours}
          selectConstraint="businessHours"
          eventConstraint="businessHours"
        />
      </div>

      <WorkHours
        isOpen={showWorkHours}
        onClose={() => setShowWorkHours(false)}
        schedule={workHours}
        onSave={(newSchedule) => {
          onWorkHoursUpdate(newSchedule);
          setShowWorkHours(false);
        }}
      />
    </div>
  );
};