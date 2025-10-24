import { Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login.component';
import { PatientMasterComponent } from './componets/patient/patient-master/patient-master.component';
import { SchedulerComponent } from './common/scheduler/scheduler';
import { DashboardComponent } from './componets/dashboard/dashboard.component';
import { DoctorAppointmentsComponent } from './componets/doctor/doctorappointments/doctorappointments.component';
import { PatientCompleteHistoryComponent } from './componets/patient/patientcompletehistory/patient-complete-history.component';
import { UserMasterComponent } from './componets/user/user-master/user-master.component';
import { BillingrecordComponent } from './componets/billing/billingrecord.component/billingrecord.component'; 
import { authGuard } from './guards/auth.guard';
import { AppconfigComponent } from './componets/appconfig/appconfig.component';
import { ForgotPasswordComponent } from './componets/login/forgotpassword/forgotpassword.component';
import { UserSearch } from './componets/user/user-search/user-search.component';
import { UserInfoComponent } from './componets/user/user-info/user-info.component';
import { UserQuickCreateComponent } from './componets/user/user-quick-create/user-quick-create.component';


export const routes: Routes = [
{ path: 'login',
    children: [
      { path: 'forgotpassword', component: ForgotPasswordComponent },
      { path: '', component: LoginComponent }
    ]
  },
  { path: 'patient', component: PatientMasterComponent, canActivate: [authGuard] },
  { path: 'scheduler', component: SchedulerComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'doctorAppointments', component: DoctorAppointmentsComponent, canActivate: [authGuard] },
  { path : 'patienthistory', component: PatientCompleteHistoryComponent, canActivate: [authGuard] },
  { path: 'user', component : UserSearch, canActivate: [authGuard] },
  { path: 'user-info', component: UserInfoComponent, canActivate: [authGuard] },
  { path: 'user-quick-create', component: UserQuickCreateComponent, canActivate: [authGuard] },
  { path: 'billing', component: BillingrecordComponent, canActivate: [authGuard] },
  { path: 'appconfig', component: AppconfigComponent, canActivate: [authGuard] },
  // Add other routes here
];
