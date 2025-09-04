// src/app/Leave apply/models/leave.models.ts

export interface LeaveRecord {
  recID: number;
  businessUnit: string;
  employeeNo: string;
  empEmailID: string;
  leaveYear: number;
  leaveType: string;
  leaveTypeName: string;
  leaveDays: number;
  leaveStart: string;
  startTime: string;
  leaveEnd: string;
  endTime: string;
  leaveReason: string;
  leaveApplicationOn: string;
  leavestatusText: string;  // Add this
  leaveStatus: string; 
  approvedComment: string;
  approverName: string;
  canEdit: boolean;
  canDelete: boolean;
}

export interface LeaveApiResponse {
  success: boolean;
  message: string;
  data: LeaveRecord[];
}
export interface LeaveType {
  recID: number;
  businessUnit: string;
  leaveType: string;
  leaveTypeName: string;
  dfLtLVDays: number;
  leaveColor: string;
  status: string;
}

export interface LeaveTypeApiResponse {
  success: boolean;
  message: string;
  data: LeaveType[];
}
// leave.models.ts
export interface LeaveBalance {
  leaveType: string;
  leaveTypeName: string;
  entitledLeave: number;
  takenLeaves: number;
  availableLeave: number;
  requestedLeave: number;
  rejectedLeave: number;
  leaveColor: string;
}

export interface LeaveBalanceApiResponse {
  success: boolean;
  message: string;
  data: LeaveBalance[];
}
