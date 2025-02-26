import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarMonthPageComponent } from './calendar-month-page.component';

describe('CalendarMonthPageComponent', () => {
  let component: CalendarMonthPageComponent;
  let fixture: ComponentFixture<CalendarMonthPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarMonthPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarMonthPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
