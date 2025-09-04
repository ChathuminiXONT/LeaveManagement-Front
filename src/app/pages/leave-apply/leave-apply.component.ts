import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LeaveService } from './services/leave.service';
import { LeaveRecord } from './models/leave.models';
import { LeaveType } from './models/leave.models';
import { LeaveBalance } from './models/leave.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leave-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, HttpClientModule],
  templateUrl: './leave-apply.component.html',
  styleUrls: ['./leave-apply.component.scss']
})
export class LeaveApplyComponent implements OnInit {
  // Modal properties
  showApplyModal = false;
  leaveType = 'Casual';
  halfDay = false;
  fromDate: string = '';
  toDate: string = '';
  days: number = 1;
  applyTo = 'TeamLead';
  reason = '';
  fromTime: string = '';
  toTime: string = '';

  showDeleteModal = false;
  leaveToDelete: LeaveRecord | null = null;
  // NEW: Edit mode tracking
  isEditMode = false;
  editingLeaveId: number | null = null;
  
  
  
  // Data from API
  leaveRequests: LeaveRecord[] = [];
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  availableLeaveMap: { [key: string]: number } = {};
  
  // Loading and error states
  isLoading = false;
  error: string | null = null;

  // Current user email - Replace with actual user email from your auth service
   currentUserEmail: string = ''; // Use the email from your swagger example

   constructor(
    private leaveService: LeaveService,
    private authService: AuthService  // Add this
  ) {}

  // --- Approver Comment Modal ---
showCommentModal = false;
currentComment: string | null = null;
commentTitle = '';
isApprovedOrRejected(status: number | string): boolean {
  const code = typeof status === 'string' ? parseInt(status) : status;
  return [1, 2, 3, 4].includes(code); // Approved (1,2) or Rejected (3,4)
}

openCommentModal(leave: any) {
  if (+leave.leaveStatus === 1 || +leave.leaveStatus === 2) {
    this.commentTitle = +leave.leaveStatus === 1 ? 'Approval Comment' : 'Rejection Comment';
    this.currentComment = leave.approvedComment || null; // 👈 API field
    this.showCommentModal = true;
  }
}

closeCommentModal() {
  this.showCommentModal = false;
  this.currentComment = null;
}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.currentUserEmail = user.emailAddress;
    }
    this.loadLeaveData();
    this.loadLeaveTypes();
    this.loadLeaveBalances();
  }

  loadLeaveData() {
    this.isLoading = true;
    this.error = null;

    this.leaveService.getLeavesByEmail(this.currentUserEmail).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.success) {
          this.leaveRequests = response.data || [];
          console.log('Leave data loaded:', this.leaveRequests);
        } else {
          this.error = response.message || 'Failed to load leave data';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading leave data:', error);
        this.error = 'Failed to load leave data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadLeaveTypes() {
    this.leaveService.getLeaveTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.leaveTypes = response.data || [];
        } else {
          this.error = response.message || 'Failed to load leave types';
        }
      },
      error: (error) => {
        console.error('Error loading leave types:', error);
        this.error = 'Failed to load leave types';
      }
    });
  }
  
  loadLeaveBalances() {
    const year = new Date().getFullYear();
    this.leaveService.getLeaveBalances(this.currentUserEmail, year).subscribe({
      next: (response) => {
        if (response.success) {
          this.leaveBalances = response.data || [];
          // create map: leaveTypeName -> availableLeave
          this.availableLeaveMap = {};
          this.leaveBalances.forEach(balance => {
            this.availableLeaveMap[balance.leaveType] = balance.availableLeave;
          });
        }
      },
      error: (error) => {
        console.error('Error loading leave balances:', error);
      }
    });
  }

  // Convert status code to text
  getStatusText(statusCode: number | string): string {
    const status = typeof statusCode === 'string' ? parseInt(statusCode) : statusCode;
    
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      case 4: return 'Rejected';
      case 5: return 'Suspend';
      default: return 'Unknown';
    }
  }

  // Helper method to format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Helper method to get status class
  getStatusClass(statusCode: number | string): string {
    const statusText = this.getStatusText(statusCode).toLowerCase();
    
    switch (statusText) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'suspend': return 'suspend';
      default: return 'pending';
    }
  }

  // UPDATED: submitLeave method now handles both create and edit
  submitLeave() {
    // Validate required fields
    if (!this.leaveType || !this.fromDate || !this.toDate || !this.days) {
      this.error = "Please fill all required fields.";
      return;
    }

    // Map display leave type to backend code
    const leaveTypeMap: { [key: string]: string } = {
      'Casual': 'C',
      'Annual': 'A',
      'Medical': 'M'
    };
    const backendLeaveType = leaveTypeMap[this.leaveType] || this.leaveType;

    // Prepare payload
    const payload = {
      BusinessUnit: 'XONT',
      EmpEmailID: this.currentUserEmail,
      LeaveType: backendLeaveType,
      LeaveYear: new Date(this.fromDate).getFullYear(),
      LeaveStart: this.fromDate,
      LeaveEnd: this.toDate,
      LeaveDays: this.days,
      LeaveReason: this.reason || '',
      StartTime: this.fromTime || '',
      EndTime: this.toTime || '',
      ApproverEmail: '',
      IsHalfDay: this.halfDay || false
    };

    console.log("Payload before API:", JSON.stringify(payload));
    console.log("Is Edit Mode:", this.isEditMode);
    console.log("Editing Leave ID:", this.editingLeaveId);

    this.isLoading = true;
    this.error = null;

    // FIXED: Check if it's edit mode or create mode
    if (this.isEditMode && this.editingLeaveId) {
      // Update existing leave
      this.leaveService.updateLeave(this.editingLeaveId, payload).subscribe({
        next: (res: any) => {
          console.log("Leave updated successfully:", res);
          this.isLoading = false;
          this.closeApplyModal();
          this.refreshData();
        },
        error: (err) => {
          console.error("Error updating leave:", err);
          console.log("Backend response body:", err.error);
          this.error = err.error?.message || "Failed to update leave.";
          this.isLoading = false;
        }
      });
    } else {
      // Create new leave
      this.leaveService.applyLeave(payload).subscribe({
        next: (res: any) => {
          console.log("Leave applied successfully:", res);
          this.isLoading = false;
          this.closeApplyModal();
          this.refreshData();
        },
        error: (err) => {
          console.error("Error applying leave:", err);
          console.log("Backend response body:", err.error);
          this.error = err.error?.message || "Failed to apply leave.";
          this.isLoading = false;
        }
      });
    }
  }

  // Stats calculations
  get casualLeavesCount(): number {
    return this.leaveRequests.filter(leave => 
      leave.leaveTypeName && leave.leaveTypeName.toLowerCase().includes('casual')
    ).length;
  }

  get medicalLeavesCount(): number {
    return this.leaveRequests.filter(leave => 
      leave.leaveTypeName && leave.leaveTypeName.toLowerCase().includes('medical')
    ).length;
  }

  get annualLeavesCount(): number {
    return this.leaveRequests.filter(leave => 
      leave.leaveTypeName && leave.leaveTypeName.toLowerCase().includes('annual')
    ).length;
  }

  get pendingRequestsCount(): number {
    const currentYear = new Date().getFullYear();

    if (!this.leaveRequests || this.leaveRequests.length === 0) return 0;

    return this.leaveRequests.filter(leave => {
      const isPending = leave.leaveStatus === '0';
      if (!isPending) return false;

      let leaveYear = null;
      if (leave.leaveYear) {
        leaveYear = leave.leaveYear;
      } else if (leave.leaveStart) {
        leaveYear = new Date(leave.leaveStart).getFullYear();
      }

      return leaveYear === currentYear;
    }).length;
  }

  // UPDATED: openApplyModal for new leave creation
  openApplyModal() {
    this.isEditMode = false;
    this.editingLeaveId = null;
    this.resetForm();
    this.showApplyModal = true;
  }

  // UPDATED: closeApplyModal with proper cleanup
  closeApplyModal() {
    this.showApplyModal = false;
    this.isEditMode = false;
    this.editingLeaveId = null;
    this.resetForm();
  }

  // NEW: Separate method to reset form
  private resetForm() {
    this.leaveType = this.leaveTypes.length > 0 ? this.leaveTypes[0].leaveType : 'Casual';
    this.halfDay = false;
    this.fromDate = '';
    this.toDate = '';
    this.fromTime = '';
    this.toTime = '';
    this.days = 1;
    this.applyTo = 'TeamLead';
    this.reason = '';
  }

  // UPDATED: editLeave method with proper data mapping
  editLeave(leave: LeaveRecord) {
    console.log("Editing leave:", leave);

    // Set edit mode
    this.isEditMode = true;
    this.editingLeaveId = leave.recID;

    // Map backend leave type to display format
    const displayLeaveTypeMap: { [key: string]: string } = {
      'C': 'Casual',
      'A': 'Annual', 
      'M': 'Medical'
    };

    // Pre-populate form with existing leave data
    this.leaveType = displayLeaveTypeMap[leave.leaveType] || leave.leaveType;
    
    // Format dates for input fields (yyyy-MM-dd format)
    this.fromDate = this.formatDateForInput(leave.leaveStart);
    this.toDate = this.formatDateForInput(leave.leaveEnd);
    
    this.days = leave.leaveDays;
    this.reason = leave.leaveReason || '';
    
    // Handle half day - check for different possible property names
    this.halfDay = (leave as any).isHalfDay || (leave as any).halfDay || (leave as any).IsHalfDay || false;
    
    // Handle time fields if they exist - check for different possible property names
    this.fromTime = (leave as any).startTime || (leave as any).fromTime || (leave as any).StartTime || '';
    this.toTime = (leave as any).endTime || (leave as any).toTime || (leave as any).EndTime || '';

    // Open the modal
    this.showApplyModal = true;
  }

  // NEW: Helper method to format date for input field
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Format as yyyy-MM-dd for HTML date input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }


deleteLeave(leave: LeaveRecord) {
  this.leaveToDelete = leave;
  this.showDeleteModal = true;
}

cancelDelete() {
  this.showDeleteModal = false;
  this.leaveToDelete = null;
}

confirmDelete() {
  if (this.leaveToDelete) {
    this.isLoading = true;
    this.leaveService.deleteLeave(this.leaveToDelete.recID).subscribe({
      next: (response) => {
        console.log("Leave deleted successfully:", response);
        this.isLoading = false;
        this.showDeleteModal = false;
        this.leaveToDelete = null;
        this.refreshData();
      },
      error: (err) => {
        console.error("Error deleting leave:", err);
        this.error = err.error?.message || "Failed to delete leave.";
        this.isLoading = false;
        this.showDeleteModal = false;
        this.leaveToDelete = null;
      }
    });
  }
}

  // Refresh data method
  refreshData() {
    this.loadLeaveData();
  }

  // Track by function for better performance
  trackByLeaveId(index: number, leave: LeaveRecord): number {
    return leave.recID;
  }

  // NEW: Helper method to get modal title
  get modalTitle(): string {
    return this.isEditMode ? 'Edit Leave Request' : 'Apply for Leave';
  }

  // NEW: Helper method to get submit button text
  get submitButtonText(): string {
    return this.isEditMode ? 'Update Leave' : 'Apply Leave';
  }
}