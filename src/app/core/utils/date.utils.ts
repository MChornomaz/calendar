export function getWeeksForMonth(startDate: Date): Date[][] {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  const firstDayOfMonth = new Date(startDate);
  firstDayOfMonth.setDate(1);

  const firstDayOfWeek = new Date(firstDayOfMonth);
  firstDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + (firstDayOfMonth.getDay() === 0 ? -6 : 1));

  for (let i = 0; i < 35; i++) {
    const currentDate = new Date(firstDayOfWeek);
    currentDate.setDate(firstDayOfWeek.getDate() + i);

    currentWeek.push(currentDate);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
}
