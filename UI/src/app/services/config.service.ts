import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../models/appconfig.model';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private apiUrl = '/api/configs'; // Adjust API endpoint as needed

  constructor(private http: HttpClient) {}

  getConfigs(): Observable<AppConfig> {
    return this.http.get<AppConfig>(this.apiUrl);
  }


  createConfig(config: AppConfig): Observable<AppConfig> {
    return this.http.post<AppConfig>(this.apiUrl, config);
  }

  updateConfig(id: number, config: AppConfig): Observable<AppConfig> {
    return this.http.put<AppConfig>(`${this.apiUrl}/${id}`, config);
  }

  deleteConfig(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}