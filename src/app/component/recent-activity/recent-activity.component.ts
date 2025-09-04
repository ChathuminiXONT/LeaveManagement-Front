import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../envirnments/environment';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface RecentActivity {
  leaveReason: string;
  leaveAppliedOn: string;
  leaveStatus: number | string; 
  updatedBy: string;
  type?: string;
  icon?: string;
  statusLabel?: string;
  statusColor?: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent implements OnInit {
  activities: RecentActivity[] = [];
  loading: boolean = true;

  // state for "View all"
  showAll: boolean = false;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchRecentActivities();
  }

  fetchRecentActivities() {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.loading = false;
      return;
    }

    const url = `${environment.apiUrl}/RecentActivity?email=${currentUser.emailAddress}`;
    this.http.get<RecentActivity[]>(url).subscribe({
      next: (data) => {
        this.activities = data
          .sort((a, b) => new Date(b.leaveAppliedOn).getTime() - new Date(a.leaveAppliedOn).getTime())
          .slice(0, 10) // still fetch 10
          .map(a => {
            const statusNum = Number(a.leaveStatus);
            return {
              ...a,
              leaveStatus: statusNum,
              type: this.getStatusType(statusNum),
              icon: this.getStatusIcon(statusNum),
              statusLabel: this.getStatusLabel(statusNum),
              statusColor: this.getStatusColor(statusNum)
            };
          });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching recent activities', err);
        this.loading = false;
      }
    });
  }

  // computed getter → only 4 unless expanded
  get visibleActivities(): RecentActivity[] {
    return this.showAll ? this.activities : this.activities.slice(0, 4);
  }

  toggleViewAll() {
    this.showAll = !this.showAll;
  }

  getStatusLabel(status: number): string {
    switch(status) {
      case 0: return 'Pending';
      case 1:
      case 2: return 'Approved';
      case 3:
      case 4: return 'Rejected';
      case 5: return 'Suspended';
      default: return 'Unknown';
    }
  }

  getStatusColor(status: number): string {
    switch(status) {
      case 0: return '#f0ad4e'; 
      case 1:
      case 2: return '#5cb85c'; 
      case 3:
      case 4: return '#d9534f'; 
      case 5: return '#6c757d'; 
      default: return '#007bff'; 
    }
  }

  getStatusType(status: number): string {
    switch(status) {
      case 0: return 'pending';
      case 1:
      case 2: return 'approved';
      case 3:
      case 4: return 'rejected';
      case 5: return 'suspended';
      default: return 'unknown';
    }
  }

  getStatusIcon(status: number): string {
    switch(status) {
      case 0: return 'clock';
      case 1:
      case 2: return 'check-circle';
      case 3:
      case 4: return 'times-circle';
      case 5: return 'ban';
      default: return 'calendar-plus';
    }
  }

  getMessage(activity: RecentActivity): string {
    return `${activity.leaveReason} (updated by ${activity.updatedBy})`;
  }

  getTime(activity: RecentActivity): string {
    const date = new Date(activity.leaveAppliedOn);
    return date.toLocaleString();
  }
}
