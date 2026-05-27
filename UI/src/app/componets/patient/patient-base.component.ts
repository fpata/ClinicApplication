import { ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';
import { DataService } from '../../services/data.service';
import { MessageService } from '../../services/message.service';
import { PatientService } from '../../services/patient.service';

/**
 * Abstract base class for all patient detail components.
 * Provides shared implementations of onClear() and onDelete().
 *
 * Concrete components must:
 *  1. extend PatientBaseComponent
 *  2. call super(dataService, patientService, messageService, router, cdr) in their constructor
 *  3. call this.initPatientSubscription() in ngOnInit()
 *  4. implement applyUserData(user) to populate component-specific fields
 *  5. call super.ngOnDestroy() in their ngOnDestroy()
 */
@Directive()
export abstract class PatientBaseComponent implements OnDestroy {
  user: User | null = null;
  patient: Patient | null = null;

  protected patientSubscription: Subscription = new Subscription();

  constructor(
    protected dataService: DataService,
    protected patientService: PatientService,
    protected messageService: MessageService,
    protected router: Router,
    protected cdr: ChangeDetectorRef
  ) { }

  /**
   * Subscribe to user$ stream and delegate to applyUserData().
   * Call this inside each component's ngOnInit().
   */
  protected initPatientSubscription(): void {
    this.patientSubscription = this.dataService.user$.subscribe({
      next: (user: User) => {
        this.user = user;
        this.patient = user?.Patients?.[0] ?? null;
        if (this.patient == null) { // If no patient is selected, redirect to patient search
          this.messageService.warn('No patient is currently selected.');
          this.router.navigate(['/patient/search']);
        }
        this.applyUserData(user);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        this.messageService.error('Error loading patient data: ' + (error?.message ?? error));
      }
    });
  }

  /**
   * Override in each component to apply component-specific state from the loaded user.
   */
  protected abstract applyUserData(user: User): void;

  // ─────────────────────────────────────────────────────────────
  // Generic Clear: re-fetches patient from API and refreshes state
  // ─────────────────────────────────────────────────────────────
  onClear(): void {
    if (!this.patient?.ID) {
      this.messageService.warn('No patient is currently selected.');
      return;
    }

    this.patientService.getPatient(this.patient.ID).subscribe({
      next: (freshUser: User) => {
        this.dataService.setUser(freshUser);
        this.messageService.info('Form has been refreshed with the latest saved data.');
      },
      error: (error: any) => {
        this.messageService.error('Failed to reload patient data: ' + (error?.message ?? error));
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Generic Delete: confirms then deletes patient and redirects
  // ─────────────────────────────────────────────────────────────
  onDelete(): void {
    if (!this.patient?.ID) {
      this.messageService.warn('No patient is currently selected.');
      return;
    }

    const patientId = this.patient.ID;
    const confirmFn: (msg: string) => Promise<boolean> =
      (window as any).showConfirm ??
      ((msg: string) => Promise.resolve(confirm(msg)));

    confirmFn('Are you sure you want to delete this patient? This action cannot be undone.').then(
      (confirmed: boolean) => {
        if (!confirmed) return;

        this.patientService.deletePatient(patientId).subscribe({
          next: () => {
            this.messageService.success('Patient deleted successfully.');
            this.router.navigate(['/patient/search']);
          },
          error: (error: any) => {
            this.messageService.error('Failed to delete patient: ' + (error?.message ?? error));
          }
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.patientSubscription?.unsubscribe();
  }

  savePatient(): void {
    this.patientService.savePatient(this.patient).subscribe({
      next: () => {
        this.messageService.success('Patient saved successfully.');
      },
      error: (error: any) => {
        this.messageService.error('Failed to save patient: ' + (error?.message ?? error));
      }
    });
  }
}
