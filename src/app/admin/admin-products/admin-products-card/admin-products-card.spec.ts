import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminProductCardComponent } from './admin-products-card';


describe('AdminProductsCard', () => {
  let component: AdminProductCardComponent;
  let fixture: ComponentFixture<AdminProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
