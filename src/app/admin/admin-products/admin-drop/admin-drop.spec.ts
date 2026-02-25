import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDrop } from './admin-drop';

describe('AdminDrop', () => {
  let component: AdminDrop;
  let fixture: ComponentFixture<AdminDrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDrop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDrop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
