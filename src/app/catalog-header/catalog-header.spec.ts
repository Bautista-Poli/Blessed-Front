import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogHeader } from './catalog-header';

describe('CatalogHeader', () => {
  let component: CatalogHeader;
  let fixture: ComponentFixture<CatalogHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
