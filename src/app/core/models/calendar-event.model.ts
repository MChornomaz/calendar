export class CalendarEvent {
  constructor(
    public id: number,
    public title: string,
    public date: Date,
    public duration: 'fixed' | 'day',
    public description: string,
    public startTime?: string,
    public endTime?: string,
  ) {}

  static create(data: { id?: number; title: string; date: Date; duration: 'fixed' | 'day'; description: string; startTime?: string; endTime?: string }): CalendarEvent {
    return new CalendarEvent(data.id ?? Math.floor(Math.random() * 1000000), data.title, data.date, data.duration, data.description, data.startTime, data.endTime);
  }
}
