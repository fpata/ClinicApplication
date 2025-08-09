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
  private readonly patientSource = new BehaviorSubject<Patient | null>(null);
  private readonly userSource = new BehaviorSubject<User | null>(null);
  private readonly calendarEvents = new BehaviorSubject<DayPilot.EventData[]>([]);
  private readonly loginUserSource = new BehaviorSubject<LoginResponse | null>(null);

  readonly patient$: Observable<Patient | null> = this.patientSource.asObservable();
  readonly user$: Observable<User | null> = this.userSource.asObservable();
  readonly calendarEvents$: Observable<DayPilot.EventData[]> = this.calendarEvents.asObservable();
  readonly loginUser$: Observable<LoginResponse | null> = this.loginUserSource.asObservable();

  setPatient(patient: Patient | null): void {
    this.patientSource.next(patient);
  }

  getPatient(): Patient | null {
    return this.patientSource.value;
  }

  setUser(user: User | null): void {
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

  getLoginUser(): LoginResponse | null {
    return this.loginUserSource.value;
  }

  setLoginUser(user: LoginResponse | null): void {
    this.loginUserSource.next(user);
  }
}
