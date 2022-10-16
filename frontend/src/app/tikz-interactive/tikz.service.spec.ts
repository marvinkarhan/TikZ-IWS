import { TestBed } from '@angular/core/testing';

import { TikzService } from './tikz.service';

describe('TikzService', () => {
  let service: TikzService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TikzService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
