import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDayPageComponent } from './calendar-day-page.component';

describe('CalendarDayPageComponent', () => {
  let component: CalendarDayPageComponent;
  let fixture: ComponentFixture<CalendarDayPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDayPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDayPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
