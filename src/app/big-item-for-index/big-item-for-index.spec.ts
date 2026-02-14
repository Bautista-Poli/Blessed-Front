import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigItemForIndex } from './big-item-for-index';

describe('BigItemForIndex', () => {
  let component: BigItemForIndex;
  let fixture: ComponentFixture<BigItemForIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigItemForIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BigItemForIndex);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
