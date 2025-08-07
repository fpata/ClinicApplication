import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService, LoginResponse } from '../../services/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule,CommonModule],
  standalone: true // This line is optional if you are using Angular 14+ with standalone components
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private loginService: LoginService, private router: Router, private dataService: DataService) {}

  login() {
    return this.loginService.login(this.username, this.password).subscribe({
      next: (res: LoginResponse) => {
        // LoginService now handles token storage and navigation
        this.dataService.setLoginUser(res);
        // Navigation is handled in LoginService
      },
      error: (err) => {
        switch (err.status) {
          case 401:
            this.error = 'Invalid username or password';
            break;
          case 0:
            this.error = 'Network error. Please try again later.';
            break;
          case 500:
            this.error = 'Server error. Please try again later.';
            break;
          case 403:
            this.error = 'Access denied. You do not have permission to access this resource.';
            break;
          default:
            this.error = 'An unexpected error occurred. Please try again.';
        }
        console.error('Login error:', err);
      }
    });
  }
}
