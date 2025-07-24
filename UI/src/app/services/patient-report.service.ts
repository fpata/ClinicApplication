import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientReport } from '../models/patient-report.model';

@Injectable({ providedIn: 'root' })
export class PatientReportService {
  private apiUrl = '/api/PatientReport';

  constructor(private http: HttpClient) {}

  getAll(pageNumber = 1, pageSize = 10): Observable<PatientReport[]> {
    return this.http.get<PatientReport[]>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  get(id: number): Observable<PatientReport> {
    return this.http.get<PatientReport>(`${this.apiUrl}/${id}`);
  }

  create(report: PatientReport): Observable<PatientReport> {
    return this.http.post<PatientReport>(this.apiUrl, report);
  }

  update(id: number, report: PatientReport): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, report);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
