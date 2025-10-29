import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { LoginResponse } from './login.service';
import { Contact } from '../models/contact.model';
import { Address } from '../models/address.model';
import { AppConfig } from '../models/appconfig.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private patientSource = new BehaviorSubject<Patient | null>(null);
  private userSource = new BehaviorSubject<User | null>(null);
  private calendarEvents = new BehaviorSubject<DayPilot.EventData[]>([]);
  private loginUserSource = new BehaviorSubject<LoginResponse | null>(null);
  private configSource = new BehaviorSubject<AppConfig | null>(null);
  private userId = new BehaviorSubject<number | null>(null);

  readonly patient$: Observable<Patient> = this.patientSource.asObservable();
  readonly user$: Observable<User> = this.userSource.asObservable();
  readonly calendarEvents$: Observable<DayPilot.EventData[]> = this.calendarEvents.asObservable();
  readonly loginUser$: Observable<LoginResponse> = this.loginUserSource.asObservable();
  readonly config$: Observable<AppConfig> = this.configSource.asObservable();
  readonly userId$: Observable<number | null> = this.userId.asObservable();

 setPatient(patient: Patient): void {
        this.patientSource.next(patient);
  }

  getPatient(): Patient | null {
    return this.patientSource.value;
  }

  setUser(newUser: User): void {
    this.userSource.next(newUser);
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

  getConfig(): AppConfig | null {
    return this.configSource.value;
  }
  setConfig(config: AppConfig): void {
    this.configSource.next(config);
  }

  setUserId(id: number | null): void {
    this.userId.next(id); 
  }

  getUserId(): number | null {
    return this.userId.value;
  }
}
