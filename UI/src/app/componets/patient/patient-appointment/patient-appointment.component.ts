import { Component, ViewChild, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PatientAppointment } from '../../../models/patient-appointment.model';
import { map, Observable } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { UtilityService } from '../../../services/utility.service';
import { User, UserType } from '../../../models/user.model';
import { SchedulerComponent } from '../../../common/scheduler/scheduler';
import { DayPilotModule, DayPilot } from '@daypilot/daypilot-lite-angular';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
import { SearchModel } from '../../../models/search.model';
import { SearchService } from '../../../services/search.service';
import { TypeaheadComponent } from '../../../common/typeahead/typeahead';
import { PatientHeaderComponent } from '../patient-header/patient-header.component';
import { PatientAppointmentService } from '../../../services/patient-appointment.service';
import { MessageService } from '../../../services/message.service';
import { PatientService } from '../../../services/patient.service';
import { PatientBaseComponent } from '../patient-base.component';

@Component({
  selector: 'app-patient-appointment',
  imports: [SchedulerComponent, DayPilotModule, FormsModule, TypeaheadComponent, PatientHeaderComponent],
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientAppointmentComponent extends PatientBaseComponent implements OnInit {

  @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;
  appointments: PatientAppointment[] | null = [];
  pendingDeleteId: number | null = null;
  private currentDeleteModal: any = null;
  isNewPatient = false;
  newAppointment: PatientAppointment = new PatientAppointment();
  newStartDateString: string;

  constructor(
    dataService: DataService,
    patientService: PatientService,
    messageService: MessageService,
    router: Router,
    cdr: ChangeDetectorRef,
    private util: UtilityService,
    private searchService: SearchService,
    private patientAppointmentService: PatientAppointmentService
  ) {
    super(dataService, patientService, messageService, router, cdr);
  }

  ngOnInit(): void {
    this.initPatientSubscription();
  }

  protected applyUserData(user: User): void {
    if (!user) { this.router.navigate(['/dashboard']); return; }
    if (!user.Patients?.length) { this.router.navigate(['/patient/search']); return; }

    this.patient = user.Patients[0] as Patient;
    this.appointments = this.patient?.PatientAppointments ?? [];

    if (this.scheduler && this.appointments?.length) {
      this.AddEventsToScheduler(this.appointments);
    }
  }

  AddEventsToScheduler(appointments: PatientAppointment[]): void {
    const events: DayPilot.EventData[] = appointments.map(a => ({
      id: a.ID.toString(),
      text: a.PatientName || 'Unknown Patient',
      start: new DayPilot.Date(a.StartDateTime),
      end: new DayPilot.Date(a.EndDateTime),
      resource: a.DoctorName || 'General',
      backColor: '#3c8dbc'
    }));
    this.scheduler.addEvents(events);
  }

  EditAppointment(appointmentID: number): void {
    const appt = this.appointments.find(a => a.ID === appointmentID);
    if (appt) this.newAppointment = { ...appt };
  }

  openDeleteModal(appointmentID: number): void {
    this.pendingDeleteId = appointmentID;
    const el = document.getElementById('confirmDeleteModal');
    if (el && (window as any).bootstrap) {
      this.currentDeleteModal = new (window as any).bootstrap.Modal(el);
      this.currentDeleteModal.show();
    } else {
      const confirmFn = (window as any).showConfirm ?? ((m: string) => Promise.resolve(confirm(m)));
      confirmFn('Are you sure you want to delete this appointment?').then((confirmed: boolean) => {
        if (confirmed) this.performDelete(appointmentID);
      });
    }
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId;
    if (id == null) return;
    this.performDelete(id);
    this.pendingDeleteId = null;
    try { this.currentDeleteModal?.hide(); } catch { }
    this.currentDeleteModal = null;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    try { this.currentDeleteModal?.hide(); } catch { }
    this.currentDeleteModal = null;
  }

  private performDelete(appointmentID: number): void {
    const index = this.appointments.findIndex(x => x.ID === appointmentID);
    if (index === -1) { this.messageService.error('Appointment not found.'); return; }

    this.patientAppointmentService.deletePatientAppointment(appointmentID).subscribe({
      next: () => {
        this.appointments.splice(index, 1);
        if (this.patient) this.patient.PatientAppointments = this.appointments;
        try { this.scheduler.removeEventById(appointmentID.toString()); } catch { }
        this.messageService.success('Appointment deleted successfully.');
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.messageService.error('Error occurred while deleting appointment. Please try again.');
      }
    });
  }

  SaveAppointment(): void {
    let baseStart = new Date(this.newAppointment.StartDateTime as any);
    if (this.newAppointment.StartTime) {
      const [h, m] = this.newAppointment.StartTime.split(':').map(Number);
      baseStart.setHours(h, m, 0, 0);
    }
    let baseEnd = new Date((this.newAppointment.EndDateTime as any) || baseStart);
    if (this.newAppointment.EndTime) {
      const [h, m] = this.newAppointment.EndTime.split(':').map(Number);
      baseEnd.setHours(h, m, 0, 0);
    }
    this.newAppointment.StartDateTime = this.util.toLocalDateTimeString(baseStart) as any;
    this.newAppointment.EndDateTime = this.util.toLocalDateTimeString(baseEnd) as any;

    if (this.newAppointment.ID < 1) {
      this.appointments.push({ ...this.newAppointment });
    } else {
      const idx = this.appointments.findIndex(a => a.ID === this.newAppointment.ID);
      if (idx > -1) this.appointments[idx] = { ...this.newAppointment };
    }
    this.AddEventsToScheduler(this.appointments);
    this.patient.PatientAppointments = this.appointments;
  }

  AddAppointment(): void {
    const user = this.dataService.getUser();
    this.newAppointment = new PatientAppointment();
    const tempID = this.appointments.length > 0
      ? Math.min(...this.appointments.map(a => a.ID)) - 1
      : 0;
    this.newAppointment.ID = tempID > 0 ? 0 : tempID;
    this.newAppointment.PatientID = this.patient?.ID ?? 1;
    this.newAppointment.UserID = user?.ID ?? 1;
    this.newAppointment.StartDateTime = new Date();
    this.newAppointment.EndDateTime = new Date();
    this.newStartDateString = this.util.formatDate(new Date());
    this.newAppointment.DoctorName = '';
    this.newAppointment.TreatmentName = '';
    this.newAppointment.PatientName = (user?.FirstName ?? '') + ' ' + (user?.LastName ?? '') || 'Unknown Patient';
    this.newAppointment.IsActive = 1;
    this.newAppointment.CreatedBy = user?.ID ?? 1;
    this.newAppointment.ModifiedBy = user?.ID ?? 1;
    this.newAppointment.CreatedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newAppointment.ModifiedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newAppointment.DoctorID = this.dataService.getLoginUser()?.user?.ID ?? 1;

    const now = this.util.roundToNearestInterval(new Date());
    const later = new Date(now.getTime() + 30 * 60000);
    this.newAppointment.StartTime = now.toLocaleTimeString('en-GB').slice(0, 5);
    this.newAppointment.EndTime = later.toLocaleTimeString('en-GB').slice(0, 5);
  }

  getDoctors = (name: string): Observable<SearchModel[]> => {
    const s = new SearchModel(this.util);
    s.UserType = UserType.Doctor;
    s.FirstName = name;
    return this.searchService.SearchUser(s).pipe(map(r => r.Results as SearchModel[]));
  };

  displayName(d: any): string {
    if (!d) return 'Unknown Patient';
    return ((d.FirstName ?? '') + ' ' + (d.LastName ?? '')).trim() || 'Unknown Patient';
  }

  onSave(): void {
    if (!this.patient?.ID) {
      this.messageService.error('Patient not found.');
      return;
    }
    super.patientService.savePatient(this.patient).subscribe({
      next: (response) => {
        this.messageService.success('Appointments saved successfully.');
      },
      error: (error) => {
        this.messageService.error('Error occurred while saving appointments. Please try again.');
      }
    });
  }

  /** Clear form: reload latest data from server */
  override onClear(): void {
    super.onClear();
  }

  /** Delete patient with confirmation */
  override onDelete(): void {
    super.onDelete();
  }
}