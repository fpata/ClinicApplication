import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LoginService, LoginResponse } from '../../services/login.service';
import { DataService } from '../../services/data.service';
import { of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginService: jasmine.SpyObj<LoginService>;
  let dataService: jasmine.SpyObj<DataService>;
  let router: jasmine.SpyObj<Router>;

  const mockLoginResponse: LoginResponse = {
    token: 'mock-token',
    user: {
      ID: 1,
      FirstName: 'John',
      LastName: 'Doe',
      UserName: 'johndoe',
      UserType: 'Doctor',
      DOB: '1985-05-15',
      LastLoginDate: '2023-08-19T10:00:00Z'
    }
  };

  beforeEach(async () => {
    const loginServiceSpy = jasmine.createSpyObj('LoginService', ['login']);
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['setLoginUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loginService = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty username, password and error', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
  });

  it('should call login service on successful login', () => {
    loginService.login.and.returnValue(of(mockLoginResponse));
    
    component.username = 'testuser';
    component.password = 'testpass';
    component.login();

    expect(loginService.login).toHaveBeenCalledWith('testuser', 'testpass');
    expect(dataService.setLoginUser).toHaveBeenCalledWith(mockLoginResponse);
    expect(component.error).toBe('');
  });

  it('should handle 401 unauthorized error', () => {
    const error = { status: 401 };
    loginService.login.and.returnValue(throwError(error));
    
    component.login();

    expect(component.error).toBe('Invalid username or password');
  });

  it('should handle network error (status 0)', () => {
    const error = { status: 0 };
    loginService.login.and.returnValue(throwError(error));
    
    component.login();

    expect(component.error).toBe('Network error. Please try again later.');
  });

  it('should handle server error (status 500)', () => {
    const error = { status: 500 };
    loginService.login.and.returnValue(throwError(error));
    
    component.login();

    expect(component.error).toBe('Server error. Please try again later.');
  });

  it('should handle forbidden error (status 403)', () => {
    const error = { status: 403 };
    loginService.login.and.returnValue(throwError(error));
    
    component.login();

    expect(component.error).toBe('Access denied. You do not have permission to access this resource.');
  });

  it('should handle unexpected error', () => {
    const error = { status: 418 };
    loginService.login.and.returnValue(throwError(error));
    
    component.login();

    expect(component.error).toBe('An unexpected error occurred. Please try again.');
  });

  it('should update username when input changes', () => {
    fixture.detectChanges();
    const usernameInput = fixture.debugElement.query(By.css('input[name="username"]'));
    
    if (usernameInput) {
      usernameInput.nativeElement.value = 'newuser';
      usernameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.username).toBe('newuser');
    }
  });

  it('should update password when input changes', () => {
    fixture.detectChanges();
    const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
    
    if (passwordInput) {
      passwordInput.nativeElement.value = 'newpass';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.password).toBe('newpass');
    }
  });
});
