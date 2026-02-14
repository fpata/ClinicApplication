import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentSearchResponse, PatientAppointment } from '../models/patient-appointment.model';
import { SearchModel } from '../models/search.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientAppointmentService {

  private readonly apiUrl = `${environment.API_BASE_URL}/PatientAppointment`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getPatientAppointments(): Observable<AppointmentSearchResponse> {
    return this.http.get<AppointmentSearchResponse>(this.apiUrl, { headers: this.getAuthHeaders() });
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

  getPatientAppointmentsByDoctorId(doctorId: number): Observable<AppointmentSearchResponse> {
    return this.http.get<AppointmentSearchResponse>(`${this.apiUrl}/doctor/${doctorId}?pageNumber=1&pageSize=1`, { headers: this.getAuthHeaders() });
  }

  searchAppointmentsForDoctor(searchPatient: SearchModel): Observable<AppointmentSearchResponse> {
    return this.http.post<AppointmentSearchResponse>(`${this.apiUrl}/doctor/search`, searchPatient, { headers: this.getAuthHeaders() });
  }

  getAllAppointments(startDate: Date, endDate: Date, currentPage: number, pageSize: number) {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pageNumber: currentPage,
      pageSize: pageSize
    };
    return this.http.get<AppointmentSearchResponse>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders(), params });
  }

  setPatinetAppointmentTime(appointments: PatientAppointment[]): PatientAppointment[] {
    for (let appt of appointments) {
      const startDate = new Date(appt.StartDateTime);
      const endDate = new Date(appt.EndDateTime);
      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      appt.StartTime = formatTime(startDate);
      appt.EndTime = formatTime(endDate);
    }
    return appointments;
  }
}
