import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/DashboardComponent/dashboard';
import { ApprovalComponent } from './pages/approval/approval.component';
import { LeaveApplyComponent } from './pages/leave-apply/leave-apply.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'leave-approval',
    component: ApprovalComponent
    
  },
  {
    path: 'leave-apply',
    component: LeaveApplyComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];