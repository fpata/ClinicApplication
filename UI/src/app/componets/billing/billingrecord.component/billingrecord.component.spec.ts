import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingrecordComponent } from './billingrecord.component';

describe('BillingrecordComponent', () => {
  let component: BillingrecordComponent;
  let fixture: ComponentFixture<BillingrecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingrecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
