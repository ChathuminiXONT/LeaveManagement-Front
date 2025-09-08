import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/DashboardComponent/dashboard';
import { ApprovalComponent } from './pages/approval/approval.component';
import { LeaveApplyComponent } from './pages/leave-apply/leave-apply.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'leave-approval', component: ApprovalComponent, canActivate: [AuthGuard] },
  { path: 'leave-apply', component: LeaveApplyComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login' }
];