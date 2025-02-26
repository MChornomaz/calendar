import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarWeekPageComponent } from './calendar-week-page.component';

describe('CalendarWeekPageComponent', () => {
  let component: CalendarWeekPageComponent;
  let fixture: ComponentFixture<CalendarWeekPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarWeekPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarWeekPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
