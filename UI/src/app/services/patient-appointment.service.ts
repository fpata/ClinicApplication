import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientAppointment } from '../models/patient-appointment.model';
import { PatientSearchModel } from '../models/patient-search.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientAppointmentService {
  private readonly apiUrl = `${environment.API_BASE_URL}/PatientAppointment`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getPatientAppointments(): Observable<PatientAppointment[]> {
    return this.http.get<PatientAppointment[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getPatientAppointment(id: number): Observable<PatientAppointment> {
    return this.http.get<PatientAppointment>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createPatientAppointment(appt: PatientAppointment): Observable<PatientAppointment> {
    return this.http.post<PatientAppointment>(this.apiUrl, appt, { headers: this.getAuthHeaders() });
  }

  updatePatientAppointment(id: number, appt: PatientAppointment): Observable<PatientAppointment> {
    return this.http.put<PatientAppointment>(`${this.apiUrl}/${id}`, appt, { headers: this.getAuthHeaders() });
  }

  deletePatientAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getPatientAppointmentsByPatientId(patientId: number): Observable<PatientAppointment[]> {
    return this.http.get<PatientAppointment[]>(`${this.apiUrl}/patient/${patientId}`, { headers: this.getAuthHeaders() });
  }

  getPatientAppointmentsByDoctorId(doctorId: number): Observable<PatientAppointment[]> {
    return this.http.get<PatientAppointment[]>(`${this.apiUrl}/doctor/${doctorId}`, { headers: this.getAuthHeaders() });
  }

  searchAppointmentsForDoctor(searchPatient: PatientSearchModel): Observable<PatientAppointment[]> {
    return this.http.post<PatientAppointment[]>(`${this.apiUrl}/doctor/search`, searchPatient, { headers: this.getAuthHeaders() });
  }
}
