import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaveRequest } from './leave.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { LeaveType } from '../leave-apply/models/leave.models';


@Injectable({ providedIn: 'root' })
export class LeaveService {
  private leaveRequestsSubject = new BehaviorSubject<LeaveRequest[]>([]);
  private apiUrl = 'https://localhost:7057/api'; 

  constructor(private http: HttpClient) {}

  getLeaveRequests(): Observable<LeaveRequest[]> {
    return this.leaveRequestsSubject.asObservable();
  }

  getUserApproverDetails(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/User/approver-details?email=${email}`);
  }

  getPendingLeavesByDepartment(departmentId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/LeaveApproval/pending-by-department?departmentId=${departmentId}`);
  }
  
  submitLeaveRequest(request: LeaveRequest): void {
    const current = this.leaveRequestsSubject.value;
    this.leaveRequestsSubject.next([...current, request]);
  }

approveLeaveRequest(approvalData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/LeaveApproval/approve`, approvalData);
}
rejectLeaveRequest(rejectionData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/LeaveApproval/reject`, rejectionData);
}
  rejectRequest(id: number, comment?: string): void {
    const updated = this.leaveRequestsSubject.value.map(req =>
      req.recID === id ? { ...req, status: 'Rejected' } : req
    );
    this.leaveRequestsSubject.next(updated);
  }
  getLeaveTypes(): Observable<LeaveType[]> {
  return this.http.get<LeaveType[]>(`${this.apiUrl}/LeaveEntry/leave-types`);
}
}
