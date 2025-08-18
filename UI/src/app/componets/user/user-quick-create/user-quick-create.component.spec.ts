import { TestBed } from '@angular/core/testing';
import { UserQuickCreateComponent } from './user-quick-create.component';


describe('UserQuickCreateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserQuickCreateComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserQuickCreateComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
