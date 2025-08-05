import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Doctorappointments } from './doctorappointments';

describe('Doctorappointments', () => {
  let component: Doctorappointments;
  let fixture: ComponentFixture<Doctorappointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Doctorappointments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Doctorappointments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
