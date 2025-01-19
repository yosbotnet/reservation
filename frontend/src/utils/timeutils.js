export const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };
export const extractTimeFromDateTime = (dateTimeStr) => {
        try {
          const date = new Date(dateTimeStr);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } catch (e) {
          console.error('Invalid DateTime:', dateTimeStr);
          return '';
        }
      };
export const isTimeInRange = (timeSlot, startDateTime, endDateTime) => {
        const timeMinutes = timeToMinutes(timeSlot);
        const startMinutes = timeToMinutes(extractTimeFromDateTime(startDateTime));
        const endMinutes = timeToMinutes(extractTimeFromDateTime(endDateTime));
        return timeMinutes >= startMinutes && timeMinutes < endMinutes;
      };