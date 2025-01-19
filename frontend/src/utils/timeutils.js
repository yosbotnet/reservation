const DAYS_MAP = {
  lunedi: 1,
  martedi: 2,
  mercoledi: 3,
  giovedi: 4,
  venerdi: 5,
  sabato: 6,
  domenica: 0
};

const DAYS_MAP_REVERSE = {
  1: 'lunedi',
  2: 'martedi',
  3: 'mercoledi',
  4: 'giovedi',
  5: 'venerdi',
  6: 'sabato',
  0: 'domenica'
};

export const formatTime = (time) => {
  if (!time) return '';
  // Handle both Date objects and time strings
  if (time instanceof Date) {
    return time.toTimeString().slice(0, 5);
  }
  // Handle time strings from database (HH:MM:SS)
  return time.slice(0, 5);
};

export const dbScheduleToBusinessHours = (schedule) => {
  if (!schedule || !Array.isArray(schedule)) return [];

  return schedule.map(slot => ({
    dow: [DAYS_MAP[slot.giornodellaSettimana.toLowerCase()]],
    startTime: formatTime(slot.orainizio),
    endTime: formatTime(slot.orafine)
  }));
};

export const businessHoursToDbSchedule = (businessHours, doctorId) => {
  if (!businessHours || !Array.isArray(businessHours)) return [];

  return businessHours.map(hours => ({
    cf: doctorId,
    giornodellaSettimana: DAYS_MAP_REVERSE[hours.dow[0]],
    orainizio: hours.startTime + ':00',
    orafine: hours.endTime + ':00'
  }));
};

export const createEmptySchedule = () => {
  return Object.keys(DAYS_MAP).map(day => ({
    dow: [DAYS_MAP[day]],
    startTime: '09:00',
    endTime: '17:00'
  }));
};