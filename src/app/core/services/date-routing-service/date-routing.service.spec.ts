import { TestBed } from '@angular/core/testing';

import { DateRoutingService } from './date-routing.service';

describe('DateRoutingService', () => {
  let service: DateRoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateRoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
