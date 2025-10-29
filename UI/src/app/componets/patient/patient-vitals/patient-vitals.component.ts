import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
import { PatientVitals } from '../../../models/patient-vitals.model';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-patient-vitals',
  imports: [FormsModule],
  templateUrl: './patient-vitals.component.html',
  styleUrls: ['./patient-vitals.component.css']
})
export class PatientVitalsComponent {


  vitals: PatientVitals | null = null;
  vitalsArray: PatientVitals[] | null = null;
  patient: Patient | null = null;
  private patientSubscription: Subscription = new Subscription();

  constructor(private dataService: DataService, private messageService: MessageService) {
  }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (_newpatient: Patient) => {
        this.patient = _newpatient;
        if (this.patient && this.patient?.PatientVitals && this.patient?.PatientVitals?.length > 0) {
          this.vitalsArray = this.patient?.PatientVitals;
          if (this.vitalsArray && this.vitalsArray.length > 0) {
          this.vitals = this.vitalsArray[this.vitalsArray.length - 1];
          } else {
            this.vitals = new PatientVitals();
            this.vitals.PatientID = this.patient?.ID || 0;
            this.vitals.UserID = this.patient?.UserID || 0;
          }
        } else {
          if (this.patient) {
            this.patient.PatientVitals = new Array<PatientVitals>(new PatientVitals());
            this.vitals = this.patient?.PatientVitals[0];
            this.vitals.PatientID = this.patient?.ID || 0;
            this.vitals.UserID = this.patient?.UserID || 0;
            this.dataService.setPatient(this.patient);
          }
        }
       // console.log('Patient updated in PatientVitalsComponent:', this.vitals);
      },
      error: (error: any) => {
        this.messageService.error('Error subscribing to patient changes:', error);
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
    if (this.vitalsArray) {
      const selectedVital = this.vitalsArray.find(vital => vital.ID === vitalID);
      if (selectedVital) {
        this.vitals = { ...selectedVital };
      }
    }
  }
}
