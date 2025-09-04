// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { LeaveService } from '../../pages/approval/leave.service'; // Adjust path as needed
// import { LeaveRequest } from '../../pages/approval/leave.model'; // Adjust path as needed
// import { AuthService } from '../../services/auth.service'; // Adjust path as needed
// import { DatePipe } from '@angular/common';
// import { LeaveType } from '../../pages/leave-apply/models/leave.models'; // Adjust path as needed

// @Component({
//   selector: 'app-pending-approvals',
//   standalone: true,
//   imports: [CommonModule, FormsModule, DatePipe],
//   templateUrl: './pending-approvals.component.html',
//   styleUrls: ['./pending-approvals.component.scss']
// })
// export class PendingApprovalsComponent implements OnInit {
//   pendingRequests: any[] = []; // Keep the same structure for template compatibility
//   totalPendingCount: number = 0; 
//   currentUserEmail = '';
//   isApprover = false;
//   approverLevel: string = '';
//   private currentDepartmentId: string = '';

//   // Add leave types array
//   // leaveTypes: LeaveType[] = [];
//   // leaveTypesMap: { [key: string]: LeaveType } = {}; // For quick lookup

//   constructor(
//     private leaveService: LeaveService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     // Get current user email from AuthService
//     const currentUser = this.authService.getUser();
//     if (currentUser) {
//       this.currentUserEmail = currentUser.emailAddress;
//       // Check if user is an approver and load data
//       this.loadApproverData();
//     } else {
//       console.error('No user logged in');
//     }
//   }

//   private loadApproverData(): void {
//     this.leaveService.getUserApproverDetails(this.currentUserEmail).subscribe({
//       next: (approverDetails) => {
//         if (approverDetails && approverDetails.isApprover) {
//           this.isApprover = true;
//           this.approverLevel = approverDetails.approverLevel;
//           const departmentId = approverDetails.departments[0]?.departmentId;
//           if (departmentId) {
//             this.currentDepartmentId = departmentId;
//             this.loadPendingRequests(departmentId);
//           }
//         } else {
//           console.log('User is not an approver');
//           this.pendingRequests = []; // Clear requests if not an approver
//           this.totalPendingCount = 0;
//         }
//       },
//       error: (error) => {
//         console.error('Error checking approver status:', error);
//         this.pendingRequests = [];
//         this.totalPendingCount = 0;
//       }
//     });
//   }

//   private loadPendingRequests(departmentId: string): void {
//     this.leaveService.getPendingLeavesByDepartment(departmentId).subscribe({
//       next: (requests: LeaveRequest[]) => {
//         console.log('Received requests from backend:', requests);
//             // Filter all pending requests
//         const allPendingRequests = requests.filter(req => req.status === '0');
        
//         // Set total count to ALL pending requests
//         this.totalPendingCount = allPendingRequests.length;
//         // Transform backend data to match the template structure and limit to first 2 requests
//         this.pendingRequests = allPendingRequests
//          // .filter(req => req.status === '0') // Only pending requests
//           .slice(0, 2) // Limit to first 2 requests
//           .map(req => ({
//             name: req.employee,
//             type: this.getLeaveTypeDisplay(req.leaveType),
//             dates: this.formatDateRange(req.from, req.to, req.days),
//             status: 'pending',
//             originalRequest: req // Keep original request for approval/rejection
//           }));
//       },
//       error: (error) => {
//         console.error('Error loading leave requests:', error);
//         this.pendingRequests = [];
//       }
//     });
//   }

//   private getLeaveTypeDisplay(leaveType: string): string {
//     // Map your backend leave types to display names
//     const typeMap: { [key: string]: string } = {
//       'C': 'Casual Leave',
//       'A': 'Annual Leave',
//       'M': 'Medical Leave',
//       // Add more mappings as needed
//     };
//     return typeMap[leaveType] || leaveType;
//   }

//   private formatDateRange(from: Date, to: Date, days: number): string {
//     const fromDate = new Date(from);
//     const toDate = new Date(to);
    
//     const options: Intl.DateTimeFormatOptions = { 
//       month: 'short', 
//       day: 'numeric' 
//     };
    
//     const fromStr = fromDate.toLocaleDateString('en-US', options);
//     const toStr = toDate.toLocaleDateString('en-US', options);
    
//     return `${fromStr} - ${toStr} (${days} days)`;
//   }

//   approveRequest(request: any): void {    
//     this.router.navigate(['/leave-approval']); 
//   }

//   rejectRequest(request: any): void {    
//     this.router.navigate(['/leave-approval']); 
//   }

  
//   viewAllRequests(): void {
//     this.router.navigate(['/leave-approval']);
//   }

//   // Optional: Add a method to refresh the data
//   refreshRequests(): void {
//     if (this.currentDepartmentId) {
//       this.loadPendingRequests(this.currentDepartmentId);
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveService } from '../../pages/approval/leave.service'; // Adjust path as needed
import { LeaveRequest } from '../../pages/approval/leave.model'; // Adjust path as needed
import { AuthService } from '../../services/auth.service'; // Adjust path as needed
import { DatePipe } from '@angular/common';
import { LeaveType } from '../../pages/leave-apply/models/leave.models'; // Adjust path as needed
import { forkJoin } from 'rxjs'; 

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './pending-approvals.component.html',
  styleUrls: ['./pending-approvals.component.scss']
})
export class PendingApprovalsComponent implements OnInit {
  pendingRequests: any[] = []; // Keep the same structure for template compatibility
  totalPendingCount: number = 0; 
  currentUserEmail = '';
  isApprover = false;
  approverLevel: string = '';
  private currentDepartmentId: string = '';

  // Add leave types array
  // leaveTypes: LeaveType[] = [];
  // leaveTypesMap: { [key: string]: LeaveType } = {}; // For quick lookup

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user email from AuthService
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.currentUserEmail = currentUser.emailAddress;
      // Check if user is an approver and load data
      this.loadApproverData();
    } else {
      console.error('No user logged in');
    }
  }

  private loadApproverData(): void {
    this.leaveService.getUserApproverDetails(this.currentUserEmail).subscribe({
      next: (approverDetails) => {
        if (approverDetails && approverDetails.isApprover) {
          this.isApprover = true;
          this.approverLevel = approverDetails.approverLevel;
          const departmentId = approverDetails.departments[0]?.departmentId;
          if (departmentId) {
            this.currentDepartmentId = departmentId;
            this.loadPendingRequests(departmentId);
          }
        } else {
          console.log('User is not an approver');
          this.pendingRequests = []; // Clear requests if not an approver
          this.totalPendingCount = 0;
        }
      },
      error: (error) => {
        console.error('Error checking approver status:', error);
        this.pendingRequests = [];
        this.totalPendingCount = 0;
      }
    });
  }

  private loadPendingRequests(departmentId: string): void {
    this.leaveService.getPendingLeavesByDepartment(departmentId).subscribe({
      next: (requests: LeaveRequest[]) => {
        console.log('Received requests from backend:', requests);
            // Filter all pending requests
        const allPendingRequests = requests.filter(req => req.status === '0');
        
        // Set total count to ALL pending requests
        this.totalPendingCount = allPendingRequests.length;
        // Transform backend data to match the template structure and limit to first 2 requests
        this.pendingRequests = allPendingRequests
         // .filter(req => req.status === '0') // Only pending requests
          .slice(0, 2) // Limit to first 2 requests
          .map(req => ({
            name: req.employee,
            type: this.getLeaveTypeDisplay(req.leaveType),
            dates: this.formatDateRange(req.from, req.to, req.days),
            status: 'pending',
            originalRequest: req // Keep original request for approval/rejection
          }));
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
        this.pendingRequests = [];
      }
    });
  }

  private getLeaveTypeDisplay(leaveType: string): string {
    // Map your backend leave types to display names
    // const typeMap: { [key: string]: string } = {
    //   'C': 'Casual Leave',
    //   'A': 'Annual Leave',
    //   'M': 'Medical Leave',
    //   // Add more mappings as needed
    // };
    //return typeMap[leaveType] || leaveType;
    return leaveType
  }

  private formatDateRange(from: Date, to: Date, days: number): string {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    
    const fromStr = fromDate.toLocaleDateString('en-US', options);
    const toStr = toDate.toLocaleDateString('en-US', options);
    
    return `${fromStr} - ${toStr} (${days} days)`;
  }

  approveRequest(request: any): void {    
    this.router.navigate(['/leave-approval']); 
  }

  rejectRequest(request: any): void {    
    this.router.navigate(['/leave-approval']); 
  }

  
  viewAllRequests(): void {
    this.router.navigate(['/leave-approval']);
  }

  // Optional: Add a method to refresh the data
  refreshRequests(): void {
    if (this.currentDepartmentId) {
      this.loadPendingRequests(this.currentDepartmentId);
    }
  }
}

