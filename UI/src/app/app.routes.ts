import { Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login';
import { PatientMasterComponent } from './componets/patient/patient-master/patient-master';
import { SchedulerComponent } from './common/scheduler/scheduler';
import { Dashboard } from './componets/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'patient', component: PatientMasterComponent },
  { path: 'scheduler', component: SchedulerComponent },
  { path: '', redirectTo: '/scheduler', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  // Add other routes here
];
