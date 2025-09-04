import { Component, OnInit } from '@angular/core';
import { LeaveService } from './leave.service';
import { LeaveRequest } from './leave.model';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { HttpClientModule  } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-approval',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, HttpClientModule],
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  selectedRequest: LeaveRequest | null = null;
  showApproveModal = false;
  showRejectModal = false;
  approveComment = '';
  rejectComment = '';

  //currentUserEmail = 'romesh.p@xontworld.com'; // Replace with your actual email
  currentUserEmail = ''; 
  isApprover = false;
  approverLevel: string = ''; 

   // Loading states
  isApprovingRequest = false;
  isRejectingRequest = false;
  loadingRequestId: number | null = null;

  private currentDepartmentId: string = '';
  
getStatusLabel(status: string): string {
  if (status === '0') return 'Pending';
  if (status === '1' || status === '2') return 'Approved';
  if (status === '3' || status === '4') return 'Rejected';
  return status;
}

getStatusClass(status: string): string {
  if (status === '0') return 'pending';
  if (status === '1' || status === '2') return 'approved';
  if (status === '3' || status === '4') return 'rejected';
  return '';
}
  constructor(private leaveService: LeaveService,
    private authService: AuthService) {}
  
  ngOnInit(): void {
    // Get current user email from AuthService
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.currentUserEmail = currentUser.emailAddress;
      // Proceed with approver details check
      this.leaveService.getUserApproverDetails(this.currentUserEmail).subscribe({
      next: (approverDetails) => {
        if (approverDetails && approverDetails.isApprover) {
          this.isApprover = true;
          this.approverLevel = approverDetails.approverLevel;
          const departmentId = approverDetails.departments[0]?.departmentId;
          if (departmentId) {
            this.currentDepartmentId = departmentId;
            this.loadLeaveRequestsByDepartment(departmentId);
          }
        } else {
          console.log('User is not an approver');
        }
      },
      error: (error) => {
        console.error('Error checking approver status:', error);
      }
    });
     } else {
      console.error('No user logged in');
      // Handle case where user is not logged in
      // You might want to redirect to login page
    }
  }
  private sortLeaveRequests(requests: LeaveRequest[]): LeaveRequest[] {
  return requests.sort((a, b) => {
    // Define priority order: 0 (Pending) = 1, 1,2 (Approved) = 2, 3,4 (Rejected) = 3
    const getPriority = (status: string): number => {
      if (status === '0') return 1; // Pending - highest priority
      if (status === '1' || status === '2') return 2; // Approved - medium priority  
      if (status === '3' || status === '4') return 3; // Rejected - lowest priority
      return 4; // Unknown status - lowest priority
    };
    
    return getPriority(a.status) - getPriority(b.status);
  });
}
 private loadLeaveRequestsByDepartment(departmentId: string): void {
    this.leaveService.getPendingLeavesByDepartment(departmentId).subscribe({
      next: (requests) => {
         console.log('Received requests from backend:', requests); 
         // Sort the requests before assigning
      this.leaveRequests = this.sortLeaveRequests(requests);
        this.leaveRequests = requests;
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
      }
    });
  }
  get approvedCount(): number {
    return this.leaveRequests.filter(req => req.status ==='1'|| req.status === '2').length;
  }

  get rejectedCount(): number {
    return this.leaveRequests.filter(req => req.status === '3'|| req.status === '4').length;
  }

  get pendingCount(): number {
    return this.leaveRequests.filter(req => req.status === '0').length;
  }
// getTimeFromString(timeString: string): string {
//   if (!timeString) return '';
//   const timeParts = timeString.split(':');
//   return `${timeParts[0]}:${timeParts[1]}`;
// }
  openApproveModal(request: LeaveRequest): void {
    this.selectedRequest = request;
    this.showApproveModal = true;
    this.approveComment = '';
  }

  openRejectModal(request: LeaveRequest): void {
    this.selectedRequest = request;
    this.showRejectModal = true;
    this.rejectComment = '';
  }

  closeModals(): void {
    this.showApproveModal = false;
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.approveComment = '';
    this.rejectComment = '';
  }

isOwnRequest(request: LeaveRequest): boolean {
  return request.empEmailID?.toLowerCase().trim() === this.currentUserEmail?.toLowerCase().trim();
}

confirmApprove(): void {
  if (this.selectedRequest&& !this.isOwnRequest(this.selectedRequest)) {
    // Set loading state
      this.isApprovingRequest = true;
      this.loadingRequestId = this.selectedRequest.recID;

    const approvalData = {
      recId: this.selectedRequest.recID,
      employeeEmail: this.selectedRequest.empEmailID,
      approverEmail: this.currentUserEmail,
      approverLevel: this.approverLevel, 
      leaveDays: this.selectedRequest.days,
      approverComment: this.approveComment
    };
console.log('Sending approval data:', approvalData);
    this.leaveService.approveLeaveRequest(approvalData).subscribe({
      next: (response) => {
        console.log('Leave approved successfully:', response);
        // Update the request status locally
        this.selectedRequest!.status = 'Approved';
        // Reload the requests to get updated data
        this.loadLeaveRequestsByDepartment(this.currentDepartmentId);
        this.closeModals();
      },
      error: (error) => {
        console.error('Error approving leave:', error);
        // Handle error - show error message to user
      },
        complete: () => {
          // Reset loading state
          this.isApprovingRequest = false;
          this.loadingRequestId = null;
        }
    });
  }else if (this.isOwnRequest(this.selectedRequest!)) {
    console.log('Cannot approve own request');
    // Optionally show a message to user
  }
}
confirmReject(): void {
  if (this.selectedRequest && !this.isOwnRequest(this.selectedRequest)) {
     // Set loading state
      this.isRejectingRequest = true;
      this.loadingRequestId = this.selectedRequest.recID;
    
    const rejectionData = {
      recId: this.selectedRequest.recID,
      employeeEmail: this.selectedRequest.empEmailID,
      approverEmail: this.currentUserEmail,
      approverLevel: this.approverLevel,
      leaveDays: this.selectedRequest.days,
      approverComment: this.rejectComment
    };

    console.log('Sending rejection data:', rejectionData);
    
    this.leaveService.rejectLeaveRequest(rejectionData).subscribe({
      next: (response) => {
        console.log('Leave rejected successfully:', response);
        this.selectedRequest!.status = 'Rejected';
        this.loadLeaveRequestsByDepartment(this.currentDepartmentId);
        this.closeModals();
      },
      error: (error) => {
        console.error('Error rejecting leave:', error);
      },
        complete: () => {
          // Reset loading state
          this.isRejectingRequest = false;
          this.loadingRequestId = null;
        }
    });
  }else if (this.isOwnRequest(this.selectedRequest!)) {
    console.log('Cannot reject own request');
  }
}
 // Helper method to check if a specific request is being processed
  isRequestLoading(requestId: number): boolean {
    return this.loadingRequestId === requestId && (this.isApprovingRequest || this.isRejectingRequest);
  }
  
}


// import { Component, OnInit } from '@angular/core';
// import { LeaveService } from './leave.service';
// import { LeaveRequest } from './leave.model';
// import { DatePipe, CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms'
// import { HttpClientModule  } from '@angular/common/http';

// @Component({
//   selector: 'app-approval',
//   standalone: true,
//   imports: [CommonModule, DatePipe, FormsModule, HttpClientModule],
//   templateUrl: './approval.component.html',
//   styleUrls: ['./approval.component.scss']
// })
// export class ApprovalComponent implements OnInit {
//   leaveRequests: LeaveRequest[] = [];
//   selectedRequest: LeaveRequest | null = null;
//   showApproveModal = false;
//   showRejectModal = false;
//   approveComment = '';
//   rejectComment = '';

//   currentUserEmail = 'romesh.p@xontworld.com'; // Replace with your actual email
//   isApprover = false;
//   approverLevel: string = ''; 

//   private currentDepartmentId: string = '';
  
// getStatusLabel(status: string): string {
//   if (status === '0') return 'Pending';
//   if (status === '1' || status === '2') return 'Approved';
//   if (status === '3' || status === '4') return 'Rejected';
//   return status;
// }

// getStatusClass(status: string): string {
//   if (status === '0') return 'pending';
//   if (status === '1' || status === '2') return 'approved';
//   if (status === '3' || status === '4') return 'rejected';
//   return '';
// }
//   constructor(private leaveService: LeaveService) {}
  
//   ngOnInit(): void {
//       this.leaveService.getUserApproverDetails(this.currentUserEmail).subscribe({
//       next: (approverDetails) => {
//         if (approverDetails && approverDetails.isApprover) {
//           this.isApprover = true;
//           this.approverLevel = approverDetails.approverLevel;
//           const departmentId = approverDetails.departments[0]?.departmentId;
//           if (departmentId) {
//             this.currentDepartmentId = departmentId;
//             this.loadLeaveRequestsByDepartment(departmentId);
//           }
//         } else {
//           console.log('User is not an approver');
//         }
//       },
//       error: (error) => {
//         console.error('Error checking approver status:', error);
//       }
//     });
//   }
//  private loadLeaveRequestsByDepartment(departmentId: string): void {
//     this.leaveService.getPendingLeavesByDepartment(departmentId).subscribe({
//       next: (requests) => {
//          console.log('Received requests from backend:', requests); 
//         this.leaveRequests = requests;
//       },
//       error: (error) => {
//         console.error('Error loading leave requests:', error);
//       }
//     });
//   }
//   get approvedCount(): number {
//     return this.leaveRequests.filter(req => req.status ==='1'|| req.status === '2').length;
//   }

//   get rejectedCount(): number {
//     return this.leaveRequests.filter(req => req.status === '3'|| req.status === '4').length;
//   }

//   get pendingCount(): number {
//     return this.leaveRequests.filter(req => req.status === '0').length;
//   }
// // getTimeFromString(timeString: string): string {
// //   if (!timeString) return '';
// //   const timeParts = timeString.split(':');
// //   return ${timeParts[0]}:${timeParts[1]};
// // }
//   openApproveModal(request: LeaveRequest): void {
//     this.selectedRequest = request;
//     this.showApproveModal = true;
//     this.approveComment = '';
//   }

//   openRejectModal(request: LeaveRequest): void {
//     this.selectedRequest = request;
//     this.showRejectModal = true;
//     this.rejectComment = '';
//   }

//   closeModals(): void {
//     this.showApproveModal = false;
//     this.showRejectModal = false;
//     this.selectedRequest = null;
//     this.approveComment = '';
//     this.rejectComment = '';
//   }

// confirmApprove(): void {
//   if (this.selectedRequest) {
//     const approvalData = {
//       recId: this.selectedRequest.recID,
//       employeeEmail: this.selectedRequest.empEmailID,
//       approverEmail: this.currentUserEmail,
//       approverLevel: this.approverLevel, 
//       leaveDays: this.selectedRequest.days,
//       approverComment: this.approveComment
//     };
// console.log('Sending approval data:', approvalData);
//     this.leaveService.approveLeaveRequest(approvalData).subscribe({
//       next: (response) => {
//         console.log('Leave approved successfully:', response);
//         // Update the request status locally
//         this.selectedRequest!.status = 'Approved';
//         // Reload the requests to get updated data
//         this.loadLeaveRequestsByDepartment(this.currentDepartmentId);
//         this.closeModals();
//       },
//       error: (error) => {
//         console.error('Error approving leave:', error);
//         // Handle error - show error message to user
//       }
//     });
//   }
// }
// confirmReject(): void {
//   if (this.selectedRequest) {
//     const rejectionData = {
//       recId: this.selectedRequest.recID,
//       employeeEmail: this.selectedRequest.empEmailID,
//       approverEmail: this.currentUserEmail,
//       approverLevel: this.approverLevel,
//       leaveDays: this.selectedRequest.days,
//       approverComment: this.rejectComment
//     };

//     console.log('Sending rejection data:', rejectionData);
    
//     this.leaveService.rejectLeaveRequest(rejectionData).subscribe({
//       next: (response) => {
//         console.log('Leave rejected successfully:', response);
//         this.selectedRequest!.status = 'Rejected';
//         this.loadLeaveRequestsByDepartment(this.currentDepartmentId);
//         this.closeModals();
//       },
//       error: (error) => {
//         console.error('Error rejecting leave:', error);
//       }
//     });
//   }
// }

//   
// }


