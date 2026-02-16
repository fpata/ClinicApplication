import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientReport } from '../../../models/patient-report.model';
import { User, UserType } from '../../../models/user.model';
import { DataService } from '../../../services/data.service';
import { UtilityService } from '../../../services/utility.service';
import { map, Observable, Subscription } from 'rxjs';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../common/fileupload/fileupload.component';
import { TypeaheadComponent } from '../../../common/typeahead/typeahead';
import { PatientHeaderComponent } from '../patient-header/patient-header.component';
import { SearchModel } from '../../../models/search.model';
import { SearchService } from '../../../services/search.service';
import { MessageService } from '../../../services/message.service';
import { PatientReportService } from '../../../services/patient-report.service';

@Component({
  selector: 'app-patient-report',
  imports: [FormsModule, FileUploadComponent, TypeaheadComponent, PatientHeaderComponent],
  templateUrl: './patient-report.component.html',
  styleUrls: ['./patient-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PatientReportComponent implements OnInit, OnDestroy {

  reports: PatientReport[] = [];
  private patientSubscription: Subscription = new Subscription();
  patient: Patient | null = null;
  newReport: PatientReport | null = null; // Initialize new report object
  patientId: number | null = null;
  isNewPatient = false;

  constructor(private dataService: DataService, private util: UtilityService,
    private searchService: SearchService,
    private messageService: MessageService,
    private reportService: PatientReportService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    // Get patient ID from route
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId')) || null;
    
    if (this.patientId === null) {
      console.error('Patient ID is required');
      this.router.navigate(['/patient/search']);
      return;
    }

    this.isNewPatient = this.patientId === 0;

    // Subscribe to user changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (newPatient: Patient) => {
        this.patient = newPatient;
        if (newPatient && newPatient.PatientReports && newPatient.PatientReports.length > 0) {
          this.reports = newPatient.PatientReports || []; // Assuming Reports is part of the patient model
        }
        else {
          this.reports = []; // Ensure reports is initialized to an empty array if no reports are
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error subscribing to patient changes:', error);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.patientSubscription) {
      this.patientSubscription.unsubscribe();
    }
  }

  AddReport() {
    var user: User | null = this.dataService.getUser();
    this.newReport = <PatientReport>{
      ID: this.reports.length > 0 ? Math.min(...this.reports.map(r => r.ID)) - 1 : 0,
      UserID: user?.ID || 0,
      PatientID: this.patient?.ID || 0,
      IsActive: 1,
      ReportDate: this.util.formatDate(new Date(), 'yyyy-MM-dd'),
      ReportName: '',
      DoctorName: '',
      ReportDetails: '',
      CreatedBy: user?.ID || 0,
      ModifiedBy: user?.ID || 0,
      ModifiedDate: this.util.formatDate(new Date(), 'yyyy-MM-dd'),
      CreatedDate: this.util.formatDate(new Date(), 'yyyy-MM-dd')
    };
  }

  EditReport(reportId: number) {
    this.newReport = <PatientReport>this.reports.find(x => x.ID === reportId);
  }

  DeleteReport(reportId: number) {
    var reportIndex = this.reports.findIndex(x => x.ID === reportId);
    this.reports.splice(reportIndex, 1);
    // Update the patient reports in the data service
    this.patient.PatientReports = this.reports;
    this.dataService.setPatient(this.patient);
    this.dataService.setPatientId(this.patient?.ID ?? null);
  }

  SaveReport() {
    if (this.newReport) {
      // Check if the report already exists
      const existingReportIndex = this.reports.findIndex(r => r.ID === this.newReport.ID);
      if (existingReportIndex > -1) {
        // Update existing report
        this.reports[existingReportIndex] = { ...this.newReport };
      } else {
        // Add new report
        this.reports.push({ ...this.newReport });
      }
      // Reset new report object
      this.newReport = null;
      this.patient.PatientReports = this.reports; // Update the patient reports in the data service
      this.dataService.setPatient(this.patient);
      this.dataService.setPatientId(this.patient?.ID ?? null);
    }
  }

  getDoctors = (name: string): Observable<SearchModel[]> => {
    var searchModel: SearchModel = new SearchModel(this.util);
    searchModel.UserType = UserType.Doctor;
    searchModel.FirstName = name;
    return this.searchService.Search(searchModel).pipe(map(result => result.Results as SearchModel[]));
  }

  displayName(d: any): string {
    if (!d) return 'Unknown Patient';
    const first = d.FirstName || '';
    const last = d.LastName || '';
    const name = (first + ' ' + last).trim();
    return name.length ? name : 'Unknown Patient';
  }

  onFileUploaded($event: any) {
    this.newReport.ReportFilePath = $event.ReportFilePath;
    console.log('File uploaded event received:', $event);
    alert('File uploaded successfully.');
  }

  DownloadReport(filePath: string) {
    if (!filePath) {
      alert('No file available for download.');
      return;
    }
    this.reportService.downloadReport(filePath).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.util.getFileNameFromPath(filePath);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

    });
  }
}