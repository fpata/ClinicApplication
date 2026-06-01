import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Patient } from '../../models/patient.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [RouterModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  loginUser: LoginResponse | null = null;
  isDarkTheme = false;
  private subscription?: Subscription;
  private patientSub?: Subscription;
  private routerSub?: Subscription;
  patient: Patient | null = null;
  patientId: number | null = null;
  isNewPatient = false;
  isLoginURL: boolean = false;
  showPatientSubnav = false;
  showUserSubnav = false;
  constructor(private dataService: DataService, private router: Router, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.router.url.match('login.*')) {
      this.loginUser = null;
      this.isLoginURL = true;
    } else {
      this.isLoginURL = false;
    }
    this.subscription = this.dataService.loginUser$.subscribe(user => {
      this.loginUser = user;
      this.cdr.markForCheck();
    });
    // subscribe to patient changes so header links can include patientId
    this.patientSub = this.dataService.user$.subscribe(p => {
      this.patient = p?.Patients[0] ?? null;
      this.patientId = this.patient?.ID ?? null;
      // If patientId is null and this is a Patient role, fallback to their stored ID
      if (this.patientId === null && this.isPatientRole) {
        this.patientId = this.authService.getLoggedInPatientId();
      }
      this.isNewPatient = (this.patientId === 0);
      this.cdr.markForCheck();
    });

    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.cdr.markForCheck();
      }
      const match = this.router.url.match(/\/patient\/(\d+)/);
      if (match && match[1]) {
        this.patientId = Number(match[1]);
        this.cdr.markForCheck();
      }
    });

    // Load theme preference
    try {
      const pref = localStorage.getItem('theme');
      this.isDarkTheme = pref === 'dark';
      this.applyTheme(this.isDarkTheme);
    } catch (e) {
      this.isDarkTheme = false;
    }

    if (this.isPatientRole) {
      this.showPatientSubnav = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.patientSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  get userRole(): string | null {
    return this.authService.getUserRole();
  }

  get showDashboardLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessDashboard;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2' || r === 'nurse' || r === '3';
  }

  get showUserMenu(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessConfig;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2';
  }

  get showPatientMenu(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessPatient;

    return !!this.userRole;
  }

  get showSchedulerLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessConfig || access.canAccessDashboard;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2';
  }

  get showBillingLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessBilling;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2' || r === 'accountant';
  }

  get showConfigLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessConfig;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2';
  }

  get isPatientRole(): boolean {
    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'patient' || r === '1';
  }

  logout(): void {
    try {
      this.authService.logout();
    } catch (e) {
      console.error('Error logging out via authService:', e);
    }
    try {
      this.dataService.setLoginUser(null);
    } catch (e) {
      console.error('Error setting login user in dataService:', e);
    }
    this.loginUser = null;
  }

  togglePatientSubnav(event: Event): void {
    event.preventDefault();
    this.showPatientSubnav = !this.showPatientSubnav;
    if (this.showPatientSubnav) this.showUserSubnav = false;
    this.cdr.markForCheck();
  }

  toggleUserSubnav(event: Event): void {
    event.preventDefault();
    this.showUserSubnav = !this.showUserSubnav;
    if (this.showUserSubnav) this.showPatientSubnav = false;
    this.cdr.markForCheck();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    try {
      localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    } catch (e) {}
    this.applyTheme(this.isDarkTheme);
  }

  private applyTheme(dark: boolean): void {
    if (typeof document !== 'undefined') {
      if (dark) document.body.classList.add('theme-dark');
      else document.body.classList.remove('theme-dark');
    }
  }
}
