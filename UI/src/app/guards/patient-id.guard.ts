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
    const patientIdParam = route.paramMap.get('patientId');
    
    // Validate that patientIdParam is provided and is a valid number
    if (!patientIdParam || isNaN(Number(patientIdParam))) {
      console.error('Invalid Patient ID');
      this.router.navigate(['/patient/search']);
      return false;
    }

    const patientId = Number(patientIdParam);
    const currentPatient = this.dataService.getPatient();
    const cachedPatientId = this.dataService.getPatientId();

    // If patient ID is 0, it's a new patient - always allow without validation
    if (patientId === 0) {
      return true;
    }

    // For existing patients, verify a patient is loaded with matching ID
    if (currentPatient && currentPatient.ID === patientId) {
      return true;
    }

    // If patient object is not present, allow if the cached patientId (from sessionStorage) matches
    if (cachedPatientId !== null && cachedPatientId === patientId) {
      return true;
    }

    console.error(`Patient not loaded. Expected ID: ${patientId}, Current: ${currentPatient?.ID}, Cached: ${cachedPatientId}`);
    this.router.navigate(['/patient/search']);
    return false;

    return true;
  }
}
