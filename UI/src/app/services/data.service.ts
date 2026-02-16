import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { LoginResponse } from './login.service';
import { Contact } from '../models/contact.model';
import { Address } from '../models/address.model';
import { AppConfig } from '../models/appconfig.model';
import { AuthService } from './auth.service';
import { Token } from '@angular/compiler';

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
  private patientId = new BehaviorSubject<number | null>(null);
  private IsQuickCreateMode = new BehaviorSubject<boolean>(false);

  readonly patient$: Observable<Patient> = this.patientSource.asObservable();
  readonly user$: Observable<User> = this.userSource.asObservable();
  readonly calendarEvents$: Observable<DayPilot.EventData[]> = this.calendarEvents.asObservable();
  readonly loginUser$: Observable<LoginResponse> = this.loginUserSource.asObservable();
  readonly config$: Observable<AppConfig> = this.configSource.asObservable();
  readonly userId$: Observable<number | null> = this.userId.asObservable();
  readonly patientId$: Observable<number | null> = this.patientId.asObservable();
  readonly IsQuickCreateMode$: Observable<boolean> = this.IsQuickCreateMode.asObservable();

  private tokenKey = 'token';
  private userKey = 'user';
  private patientKey = 'patientId';

  setPatient(patient: Patient): void {
    this.patientSource.next(patient);
    // update patientId and persist to sessionStorage as a fallback for refresh
    const id = patient?.ID ?? null;
    this.patientId.next(id);
    if (id === null) {
      sessionStorage.removeItem(this.patientKey);
    } else {
      try { sessionStorage.setItem(this.patientKey, String(id)); } catch (e) { /* ignore */ }
    }
  }

  getPatient(): Patient | null {
    return this.patientSource.value;
  }

  setPatientId(id: number | null): void {
    this.patientId.next(id);
    if (id === null) {
      sessionStorage.removeItem(this.patientKey);
    } else {
      try { sessionStorage.setItem(this.patientKey, String(id)); } catch (e) { /* ignore */ }
    }
  }

  getPatientId(): number | null {
    const v = this.patientId.value;
    if (v !== null) return v;
    const s = sessionStorage.getItem(this.patientKey);
    return s ? Number(s) : null;
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
    if (this.loginUserSource.value === null) {
      var response = new LoginResponse();
      response.token = localStorage.getItem(this.tokenKey);
      response.user = JSON.parse(localStorage.getItem(this.userKey));
      this.setLoginUser(response);
    }
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

  setQuickCreateMode(isQuickCreate: boolean): void {
    this.IsQuickCreateMode.next(isQuickCreate);
  }

  getQuickCreateMode(): boolean {
    return this.IsQuickCreateMode.value;
  }
}
