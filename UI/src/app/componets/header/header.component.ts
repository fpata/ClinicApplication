import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';
import { Router, RouterModule } from '@angular/router';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  loginUser: LoginResponse | null = null;
  private subscription?: Subscription;
  private patientSub?: Subscription;
  patient: Patient | null = null;
  patientId: number | null = null;
  isNewPatient = false;
  isLoginURL: boolean = false;
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
    this.patientSub = this.dataService.patient$.subscribe(p => {
      this.patient = p;
      this.patientId = p?.ID ?? null;
      this.isNewPatient = (this.patientId === 0);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.patientSub?.unsubscribe();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.dataService.setLoginUser(null);
    this.loginUser = null;
  }
}
