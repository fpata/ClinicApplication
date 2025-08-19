import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { Header } from './header.component';
import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';

describe('HeaderComponent', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let dataService: jasmine.SpyObj<DataService>;
  let loginUserSubject: BehaviorSubject<LoginResponse | null>;

  const mockLoginResponse: LoginResponse = {
    token: 'mock-token',
    user: {
      ID: 1,
      UserName: 'testuser',
      UserType: 'Doctor',
      FirstName: 'John',
      LastName: 'Doe',
      DOB: '1985-05-15',
      LastLoginDate: '2023-08-19T10:00:00Z'
    }
  };

  beforeEach(async () => {
    loginUserSubject = new BehaviorSubject<LoginResponse | null>(null);
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['setLoginUser'], {
      loginUser$: loginUserSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null loginUser', () => {
    expect(component.loginUser).toBeNull();
  });

  describe('Subscription Management', () => {
    it('should subscribe to loginUser$ on init', () => {
      component.ngOnInit();
      
      loginUserSubject.next(mockLoginResponse);
      
      expect(component.loginUser).toEqual(mockLoginResponse);
    });

    it('should unsubscribe on destroy', () => {
      component.ngOnInit();
      spyOn(component['subscription']!, 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
    });

    it('should handle unsubscribe when no subscription exists', () => {
      // No ngOnInit called, so subscription is undefined
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should update loginUser when data service emits new value', () => {
      component.ngOnInit();
      
      expect(component.loginUser).toBeNull();
      
      loginUserSubject.next(mockLoginResponse);
      expect(component.loginUser).toEqual(mockLoginResponse);
      
      loginUserSubject.next(null);
      expect(component.loginUser).toBeNull();
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'existing-token');
      component.loginUser = mockLoginResponse;
    });

    it('should clear token from localStorage', () => {
      component.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should call dataService.setLoginUser with null', () => {
      component.logout();
      
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
    });

    it('should set loginUser to null', () => {
      component.logout();
      
      expect(component.loginUser).toBeNull();
    });

    it('should handle logout when no token exists', () => {
      localStorage.removeItem('token');
      
      expect(() => component.logout()).not.toThrow();
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
      expect(component.loginUser).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete login/logout cycle', () => {
      // Start with no user
      component.ngOnInit();
      expect(component.loginUser).toBeNull();
      
      // Simulate login
      loginUserSubject.next(mockLoginResponse);
      expect(component.loginUser).toEqual(mockLoginResponse);
      
      // Simulate logout
      component.logout();
      expect(component.loginUser).toBeNull();
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
      
      // Cleanup
      component.ngOnDestroy();
    });

    it('should handle multiple user changes', () => {
      component.ngOnInit();
      
      const anotherUser: LoginResponse = {
        ...mockLoginResponse,
        user: { ...mockLoginResponse.user, ID: 2, UserName: 'anotheruser' }
      };
      
      loginUserSubject.next(mockLoginResponse);
      expect(component.loginUser?.user.UserName).toBe('testuser');
      
      loginUserSubject.next(anotherUser);
      expect(component.loginUser?.user.UserName).toBe('anotheruser');
      
      loginUserSubject.next(null);
      expect(component.loginUser).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined subscription gracefully', () => {
      component['subscription'] = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle localStorage errors during logout', () => {
      spyOn(localStorage, 'removeItem').and.throwError('Storage error');
      spyOn(console, 'error');
      
      expect(() => component.logout()).not.toThrow();
      // Component should still call dataService even if localStorage fails
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
    });

    it('should handle dataService errors gracefully', () => {
      dataService.setLoginUser.and.throwError('DataService error');
      spyOn(console, 'error');
      
      expect(() => component.logout()).not.toThrow();
    });
  });
});
