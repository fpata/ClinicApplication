import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { LoginResponse } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  patientSource = new BehaviorSubject<Patient | null>(null);
  userSource = new BehaviorSubject<User | null>(null);
  calendarEvents = new BehaviorSubject<DayPilot.EventData[]>([]);
  loginUserSource = new BehaviorSubject<LoginResponse | null>(null);

  patient$: Observable<Patient> = this.patientSource.asObservable();
  user$: Observable<User> = this.userSource.asObservable();
  calendarEvents$: Observable<DayPilot.EventData[]> = this.calendarEvents.asObservable();
  loginUser$: Observable<LoginResponse> = this.loginUserSource.asObservable();

  setPatient(patient: Patient): void {
    this.patientSource.next(patient);
  }

  getPatient(): Patient | null {
    return this.patientSource.value;
  }

  setUser(user: User): void {
    this.userSource.next(user);
  }

  getUser(): User | null {
    return this.userSource.value;
  }

  getCalendarEvents(): DayPilot.EventData[] {
    return this.calendarEvents.value;
  }

  setCalendarEvents(events: DayPilot.EventData[]): void {
    this.calendarEvents.next(events);
  }

  getLoginUser(): LoginResponse {
    return this.loginUserSource.value;
  }

  setLoginUser(user: LoginResponse): void {
    this.loginUserSource.next(user);
  }
}
