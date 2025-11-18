import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
import { PatientVitals } from '../../../models/patient-vitals.model';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../services/message.service';
import { UtilityService } from '../../../services/utility.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-vitals',
  imports: [FormsModule],
  templateUrl: './patient-vitals.component.html',
  styleUrls: ['./patient-vitals.component.css']
})
export class PatientVitalsComponent {
  vitals: PatientVitals | null = null;
  patient: Patient | null = null;

  private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService, private messageService: MessageService,
    private util: UtilityService, private authService :AuthService
  ) {
      this.vitals = new PatientVitals();
  }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (_newpatient: Patient) => {
        this.patient = _newpatient;
        if (this.patient && this.patient?.PatientVitals && this.patient?.PatientVitals?.length > 0) {
            
            Object.assign(this.vitals, this.patient.PatientVitals[this.patient.PatientVitals.length - 1] as PatientVitals); // get the last vitals entry
        } 
      },
      error: (error: any) => {
        this.messageService.error('Error subscribing to patient changes:', error?.message || error?.toString());
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.patientSubscription) {
      this.patientSubscription.unsubscribe();
    }
  }

  SetValuesForVitalID(vitalID: number) {
    if (this.patient?.PatientVitals) {
      var selectedVital = this.patient.PatientVitals.find(vital => vital.ID === vitalID);
      if (selectedVital && this.vitals) {
        this.vitals = selectedVital;
      }
    }
  }

  AddPatientVitals() {
    this.vitals = new PatientVitals();
    if (this.patient) {
      this.vitals.PatientID = this.patient.ID || 0;
      this.vitals.UserID = this.patient.UserID || 0;
      this.vitals.RecordedBy = this.authService.getUser().ID || 0;
      if (!this.patient.PatientVitals) {
        this.patient.PatientVitals = [];
      }
      this.patient.PatientVitals.push(this.vitals);
    }
  }
}