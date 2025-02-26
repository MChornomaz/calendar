import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarYearPageComponent } from './calendar-year-page.component';

describe('CalendarYearPageComponent', () => {
  let component: CalendarYearPageComponent;
  let fixture: ComponentFixture<CalendarYearPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarYearPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarYearPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
