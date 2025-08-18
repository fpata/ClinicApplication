import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillingRecord } from '../models/billing.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {

private apiUrl = `${environment.API_BASE_URL}/Billing`; // Adjust as needed

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getBillings(): Observable<BillingRecord[]> {
    return this.http.get<BillingRecord[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getBilling(id: number): Observable<BillingRecord> {
    return this.http.get<BillingRecord>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createBilling(Billing: BillingRecord): Observable<BillingRecord> {
    return this.http.post<BillingRecord>(this.apiUrl, Billing, { headers: this.getAuthHeaders() });
  }

  updateBilling(id: number, Billing: BillingRecord): Observable<BillingRecord> {
    return this.http.put<BillingRecord>(`${this.apiUrl}/${id}`, Billing, { headers: this.getAuthHeaders() });
  }

  deleteBilling(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
