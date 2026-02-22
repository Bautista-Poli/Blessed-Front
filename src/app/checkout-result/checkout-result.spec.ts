import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutResult } from './checkout-result';

describe('CheckoutResult', () => {
  let component: CheckoutResult;
  let fixture: ComponentFixture<CheckoutResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
