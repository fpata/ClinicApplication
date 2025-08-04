import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';
import { DayPilotCalendarComponent, DayPilotModule } from '@daypilot/daypilot-lite-angular';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { LoginResponse } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private patientSource = new BehaviorSubject<Patient | null>(null);
  private userSource = new BehaviorSubject<User | null>(null);

  patient$ = this.patientSource.asObservable();
  user$ = this.userSource.asObservable();
  private calendarEvents = new BehaviorSubject<DayPilot.EventData[]>([]); 
  calendarEvents$ = this.calendarEvents.asObservable(); 
  private loginUser: LoginResponse | null = null;
  $loginUser = new BehaviorSubject<LoginResponse | null>(null);

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

  getCalendarEvents(): DayPilot.EventData[] {
    return this.calendarEvents.value;
  }
  
  setCalendarEvents(events: DayPilot.EventData[]) {
    this.calendarEvents.next(events);
  }

  getLoginUser(): LoginResponse | null {
    return this.loginUser;
  }

  setLoginUser(user: LoginResponse) {
    this.loginUser = user;
    this.$loginUser.next(user);
  }
}
