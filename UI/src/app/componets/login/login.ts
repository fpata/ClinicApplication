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
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          this.dataService.setLoginUser(res);
          this.router.navigate(['/patient']);
        } else {
          this.error = 'Invalid username or password';
        }
      },
      error: () => {
        this.error = 'Invalid username or password';
      }
    });
  }
}
