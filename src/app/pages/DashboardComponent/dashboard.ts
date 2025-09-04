import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all your standalone components here (adjust paths)
//import { SidebarComponent } from '../../component/sidebar/sidebar.component';
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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    //SidebarComponent,
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
export class DashboardComponent implements OnInit{
  userName = 'Admin User';
  pendingCount = 5;
  approvedCount = 12;
  rejectedCount = 2;
  totalEmployees = 24;
  isLoading = false;

   // Add approver status properties
  isApprover = false;
  currentUserEmail = '';
  isCheckingApproverStatus = true; // To show loading while checking

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
     private authService: AuthService,
    private leaveService: LeaveService
  ) {}
 ngOnInit(): void {
    this.checkApproverStatus();
  }
  private checkApproverStatus(): void {
    // Get current user email from AuthService
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.currentUserEmail = currentUser.emailAddress;
      this.userName = currentUser.userName || 'User';
      
      // Check if user is an approver
      this.leaveService.getUserApproverDetails(this.currentUserEmail).subscribe({
        next: (approverDetails) => {
          this.isApprover = approverDetails && approverDetails.isApprover;
          console.log('User approver status:', this.isApprover);
          this.isCheckingApproverStatus = false;
        },
        error: (error) => {
          console.error('Error checking approver status:', error);
          this.isApprover = false;
          this.isCheckingApproverStatus = false;
        }
      });
    } else {
      console.error('No user logged in');
      this.isApprover = false;
      this.isCheckingApproverStatus = false;
      // Handle case where user is not logged in
    }
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

      const data = 'Mock report data\n\n' +
                   `Date: ${new Date().toLocaleString()}\n` +
                   `Pending: ${this.pendingCount}\n` +
                   `Approved: ${this.approvedCount}\n` +
                   `Rejected: ${this.rejectedCount}`;

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
    // Implement your leave request logic here
  }

  onGenerateReport() {
    this.generateReport();
  }
}
