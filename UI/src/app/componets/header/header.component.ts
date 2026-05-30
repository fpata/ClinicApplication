import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Patient } from '../../models/patient.model';

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
  constructor(private dataService: DataService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.router.url.match('login.*')) {
      this.loginUser = null;
      this.isLoginURL = true;
    } else {
      this.isLoginURL = false;
    }
    this.subscription = this.dataService.loginUser$.subscribe(user => {
      this.loginUser = user;
    });
    // subscribe to patient changes so header links can include patientId
    this.patientSub = this.dataService.user$.subscribe(p => {
      this.patient = p?.Patients[0] ?? null;
      this.patientId = this.patient?.ID ?? null;
      this.isNewPatient = (this.patientId === 0);
      this.cdr.markForCheck();
    });

    // Previously subnavs were hidden on every route change which caused
    // the patient submenu to disappear when navigating within patient pages.
    // Keep subnav visibility until another parent menu is explicitly clicked.
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        // Do not auto-hide subnavs on navigation. Keep current state.
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
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.patientSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  logout(): void {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      console.error('Error removing token from localStorage:', e);
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
