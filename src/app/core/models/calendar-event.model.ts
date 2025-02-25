export class CalendarEvent {
  constructor(
    public id: number,
    public title: string,
    public date: Date,
    public time: string,
    public description: string
  ) {}
}
