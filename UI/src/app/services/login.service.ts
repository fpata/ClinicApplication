import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, switchMap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserType } from '../models/user.model';
import { DataService } from './data.service';

export class LoginResponse {
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
  allowedAccess?: {
    canAccessPatient: boolean;
    canAccessDashboard: boolean;
    canAccessBilling: boolean;
    canAccessConfig: boolean;
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
        switchMap(response => {
          if (response.token) {
            this.authService.setToken(response.token);
            this.authService.setUser(response.user);
            this.authService.setAllowedAccess(response.allowedAccess);

            const userRole = this.authService.getUserRole();
            const isAdmin = userRole && (userRole.toString().toLowerCase() === 'admin' || userRole.toString().toLowerCase() === 'administrator' || userRole.toString() === '5');
            const isPatient = !isAdmin && userRole && (userRole.toString().toLowerCase() === 'patient' || userRole.toString() === '1');

            if (isPatient) {
              const headers = new HttpHeaders({ Authorization: `Bearer ${response.token}` });
              return this.http.get<any>(`${environment.API_BASE_URL}/patient/Latest/${response.user.ID}`, { headers }).pipe(
                tap(patient => {
                  if (patient && patient.ID) {
                    this.authService.setLoggedInPatientId(patient.ID);
                    const mockUser = { ...response.user, Patients: [patient] };
                    this.dataService.setUser(mockUser as any);
                  }
                  const nextRoute = this.authService.getDefaultRouteForRole(userRole);
                  this.router.navigate([nextRoute]);
                }),
                switchMap(() => of(response)),
                catchError(err => {
                  console.error('Failed to get patient details for login user:', err);
                  const nextRoute = this.authService.getDefaultRouteForRole(userRole);
                  this.router.navigate([nextRoute]);
                  return of(response);
                })
              );
            } else {
              const nextRoute = isAdmin ? '/dashboard' : this.authService.getDefaultRouteForRole(userRole);
              this.router.navigate([nextRoute]);
            }
          }
          return of(response);
        })
      );
  }

  logout(): void {
    this.authService.logout();
  }
}
