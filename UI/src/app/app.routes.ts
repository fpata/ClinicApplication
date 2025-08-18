import { Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login.component';
import { PatientMasterComponent } from './componets/patient/patient-master/patient-master.component';
import { SchedulerComponent } from './common/scheduler/scheduler';
import { Dashboard } from './componets/dashboard/dashboard.component';
import { DoctorAppointmentsComponent } from './componets/doctor/doctorappointments/doctorappointments.component';
import { PatientCompleteHistoryComponent } from './componets/patient/patientcompletehistory/patient-complete-history.component';
import { UserMasterComponent } from './componets/user/user-master/user-master.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'patient', component: PatientMasterComponent, canActivate: [authGuard] },
  { path: 'scheduler', component: SchedulerComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'doctorAppointments', component: DoctorAppointmentsComponent, canActivate: [authGuard] },
  { path : 'patienthistory', component: PatientCompleteHistoryComponent, canActivate: [authGuard] },
  { path: 'user', component : UserMasterComponent, canActivate: [authGuard] }
  // Add other routes here
];
