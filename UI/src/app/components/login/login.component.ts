import { Component } from '@angular/core';
import {FormBuilder,Validators,FormGroup,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { User } from '../../models/user.model';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  user: User | null = null;

  constructor(private fb: FormBuilder, private loginService: LoginService) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { userName, password } = this.loginForm.value;
      this.loginService.login(userName, password).subscribe({
        next: (res) => {
          this.user = res.user;
          localStorage.setItem('token', res.token);
          this.errorMessage = '';
          // Redirect or update UI as needed
        },
        error: () => {
          this.errorMessage = 'Invalid username or password.';
        }
      });
    }
  }
}
