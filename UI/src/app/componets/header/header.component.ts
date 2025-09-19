import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class Header implements OnInit, OnDestroy {
  loginUser: LoginResponse | null = null;
  private subscription?: Subscription;
   isLoginURL: boolean = false;
  constructor(private dataService: DataService, private router: Router) {}

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
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.dataService.setLoginUser(null);
    this.loginUser = null;
  }
}
