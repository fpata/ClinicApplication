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

    // hide subnavs on route changes
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.showPatientSubnav = false;
        this.showUserSubnav = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.patientSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.dataService.setLoginUser(null);
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
}
