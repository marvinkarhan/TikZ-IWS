import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TikzInteractiveComponent } from './tikz-interactive.component';

describe('TikzInteractiveComponent', () => {
  let component: TikzInteractiveComponent;
  let fixture: ComponentFixture<TikzInteractiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TikzInteractiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TikzInteractiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
