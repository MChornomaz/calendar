export function generateTimeHours() {
  return Array.from({ length: 24 }, (_, i) => {
    const startHour = i % 12 || 12;
    const period = i < 12 ? 'AM' : 'PM';
    const endHour = (i + 1) % 12 || 12;
    const endPeriod = i + 1 < 12 ? 'AM' : 'PM';

    return {
      id: i,
      startTime: `${startHour}:00 ${period}`,
      endTime: `${endHour}:00 ${endPeriod}`,
    };
  });
}

export function parseTime(time: string): Date {
  const [timeStr, period] = time.split(' ');
  const [initialHours, minutes] = timeStr.split(':').map((num) => parseInt(num, 10));

  let hours = initialHours;

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}
