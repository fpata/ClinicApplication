import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingmasterComponent } from './billingmaster.component';

describe('BillingmasterComponent', () => {
  let component: BillingmasterComponent;
  let fixture: ComponentFixture<BillingmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
