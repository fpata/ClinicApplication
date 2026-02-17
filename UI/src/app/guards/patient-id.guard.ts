import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class PatientIdGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
   
   return true;
  }
}
