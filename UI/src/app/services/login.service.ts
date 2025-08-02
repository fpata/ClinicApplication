import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  user: {
    ID: number;
    UserName: string;
    UserType: string;
    FirstName: string;
    LastName: string;
    DOB?: string;
    LastLoginDate?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = 'https://localhost:7230/api/login';

  constructor(private http: HttpClient) {}

  login(UserName: string, Password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { UserName, Password });
  }
}
