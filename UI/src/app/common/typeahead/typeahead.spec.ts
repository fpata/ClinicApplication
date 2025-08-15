import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Typeahead } from './typeahead';

describe('Typeahead', () => {
  let component: Typeahead;
  let fixture: ComponentFixture<Typeahead>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Typeahead]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Typeahead);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
