import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { PatientHeaderComponent } from '../patient-header/patient-header.component';

@Component({
  selector: 'app-patient-history',
  imports: [FormsModule, PatientHeaderComponent],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientHistoryComponent implements OnInit, OnDestroy {
  patient: Patient; // Assuming patient is defined and has the necessary properties
  patientId: number | null = null;
  isNewPatient = false;

  private patientSubscription: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get patient ID from route
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId')) || null;
    
    if (this.patientId === null) {
      console.error('Patient ID is required');
      this.router.navigate(['/patient/search']);
      return;
    }

    this.isNewPatient = this.patientId === 0;

    // Subscribe to patient changes from the data service
    this.patientSubscription = this.dataService.patient$.subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
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

}
