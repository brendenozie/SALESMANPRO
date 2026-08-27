// utils/time.ts
export const addMinutes = (hhmm: string, minutes: number) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export const formatTime = (date: Date) => {
  return date.toISOString().substring(11, 16);
};

export const parseTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
};

export const timeDifferenceInMinutes = (start: string, end: string) => {
  const startDate = parseTime(start);
  const endDate = parseTime(end);
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
};
