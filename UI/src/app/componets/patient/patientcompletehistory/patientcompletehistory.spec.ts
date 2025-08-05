import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Patientcompletehistory } from './patientcompletehistory';

describe('Patientcompletehistory', () => {
  let component: Patientcompletehistory;
  let fixture: ComponentFixture<Patientcompletehistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Patientcompletehistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Patientcompletehistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
