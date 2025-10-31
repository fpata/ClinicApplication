import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserType } from '../models/user.model';
import { DataService } from './data.service';

export interface LoginResponse {
  token: string;
  user: {
    ID: number;
    UserName: string;
    UserType: UserType;
    FirstName: string;
    LastName: string;
    DOB?: string;
    LastLoginDate?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = `${environment.API_BASE_URL}/login`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService, private dataService: DataService
  ) {}

  login(UserName: string, Password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { UserName, Password })
      .pipe(
        tap(response => {
          if (response.token) {
            this.authService.setToken(response.token);
            this.authService.setUser(response.user);
            this.router.navigate(['/dashboard']);
          }
        })
      );
  }

  logout(): void {
    this.authService.logout();
  }
}
