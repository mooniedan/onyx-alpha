import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceInputComponent } from './finance-input.component';

describe('FinanceInputComponent', () => {
  let component: FinanceInputComponent;
  let fixture: ComponentFixture<FinanceInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinanceInputComponent]
    });
    fixture = TestBed.createComponent(FinanceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
