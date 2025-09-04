export interface LeaveRequest {
  recID: number;
  employee: string;
  empEmailID: string;
  from: Date;
  to: Date;
  startTime?: Date; 
  endTime?: Date; 
  days: number;
  reason: string;
  leaveType: string;
  status: string;
  leaveBalance: number;
}
