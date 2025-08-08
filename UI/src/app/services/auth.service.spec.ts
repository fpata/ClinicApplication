import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get token and report logged in', () => {
    service.setToken('header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000) + 3600 })) + '.sig');
    expect(service.getToken()).toBeTruthy();
    expect(service.isLoggedIn).toBeTrue();
  });

  it('should logout and navigate to login', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    service.setToken('header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000) + 10 })) + '.sig');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
