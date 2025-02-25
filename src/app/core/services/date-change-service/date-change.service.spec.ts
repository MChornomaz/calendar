import { TestBed } from '@angular/core/testing';

import { DateChangeService } from './date-change.service';

describe('DateChangeService', () => {
  let service: DateChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
