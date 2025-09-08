import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../component/header/header.component';
import { LeaveBalanceComponent } from '../../component/leave-balance/leave-balance.component';
import { PendingApprovalsComponent } from '../../component/pending-approvals/pending-approvals.component';
import { RecentActivityComponent } from '../../component/recent-activity/recent-activity.component';
import { TeamCalendarComponent } from '../../component/team-calender/team-calendar.component';
import { LeaveStatisticsComponent } from '../../component/leave-statistic/leave-statistics.component';
import { QuickActionsComponent } from '../../component/quick-action/quick-actions.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../approval/leave.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    LeaveBalanceComponent,
    PendingApprovalsComponent,
    RecentActivityComponent,
    TeamCalendarComponent,
    LeaveStatisticsComponent,
    QuickActionsComponent,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class DashboardComponent implements OnInit {
  userName = 'User';
  pendingCount = 5;
  approvedCount = 12;
  rejectedCount = 2;
  totalEmployees = 24;
  isLoading = false;

  isApprover = false;
  currentUserEmail = '';
  isCheckingApproverStatus = true;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private leaveService: LeaveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.currentUserEmail = currentUser.emailAddress;
    this.userName = currentUser.userName || 'User';
    this.checkApproverStatus();
  }

  private checkApproverStatus(): void {
    this.leaveService.getUserApproverDetails(this.currentUserEmail).subscribe({
      next: (approverDetails) => {
        this.isApprover = approverDetails?.isApprover || false;
        this.isCheckingApproverStatus = false;
      },
      error: () => {
        this.isApprover = false;
        this.isCheckingApproverStatus = false;
      }
    });
  }

  quickApprove() {
    this.isLoading = true;
    setTimeout(() => {
      this.pendingCount = 0;
      this.approvedCount += 5;
      this.snackBar.open('Approved 5 pending requests', 'Dismiss', { duration: 3000 });
      this.isLoading = false;
    }, 1500);
  }

  generateReport() {
    this.isLoading = true;
    setTimeout(() => {
      this.snackBar.open('Report generated successfully', 'Dismiss', { duration: 3000 });

      const data = `Mock report data\n\nDate: ${new Date().toLocaleString()}\nPending: ${this.pendingCount}\nApproved: ${this.approvedCount}\nRejected: ${this.rejectedCount}`;

      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave-report-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);

      this.isLoading = false;
    }, 2000);
  }

  onRequestLeave() {
    console.log('Request Leave clicked');
  }

  onGenerateReport() {
    this.generateReport();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}