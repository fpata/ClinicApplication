import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  
  if (authService.isLoggedIn) {
    return true;
  } else {
    authService.redirectToLogin();
    return false;
  }
};
