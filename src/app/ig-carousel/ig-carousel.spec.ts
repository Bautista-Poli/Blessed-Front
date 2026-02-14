import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgCarousel } from './ig-carousel';

describe('IgCarousel', () => {
  let component: IgCarousel;
  let fixture: ComponentFixture<IgCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IgCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IgCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
