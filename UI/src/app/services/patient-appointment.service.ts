import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientAppointment } from '../models/patient-appointment.model';

@Injectable({ providedIn: 'root' })
export class PatientAppointmentService {
  private apiUrl = '/api/PatientAppointment';

  constructor(private http: HttpClient) {}

  getAll(pageNumber = 1, pageSize = 10): Observable<PatientAppointment[]> {
    return this.http.get<PatientAppointment[]>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  get(id: number): Observable<PatientAppointment> {
    return this.http.get<PatientAppointment>(`${this.apiUrl}/${id}`);
  }

  create(appointment: PatientAppointment): Observable<PatientAppointment> {
    return this.http.post<PatientAppointment>(this.apiUrl, appointment);
  }

  update(id: number, appointment: PatientAppointment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, appointment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
