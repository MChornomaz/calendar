import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventInfoCardComponent } from './event-info-card.component';

describe('EventInfoCardComponent', () => {
  let component: EventInfoCardComponent;
  let fixture: ComponentFixture<EventInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventInfoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
