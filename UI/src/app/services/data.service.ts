import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private patientSource = new BehaviorSubject<Patient | null>(null);
  private userSource = new BehaviorSubject<User | null>(null);

  patient$ = this.patientSource.asObservable();
  user$ = this.userSource.asObservable();

  setPatient(patient: Patient) {
    this.patientSource.next(patient);
  }

  getPatient(): Patient | null {
    return this.patientSource.value;
  }

  setUser(user: User) {
    this.userSource.next(user);
  }

  getUser(): User | null {
    return this.userSource.value;
  }
}
