import { TestBed } from '@angular/core/testing';

import { CalendarEventChangeService } from './calendar-event-change.service';

describe('CalendarEventChangeService', () => {
  let service: CalendarEventChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarEventChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
