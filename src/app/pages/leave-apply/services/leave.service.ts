// src/app/Leave apply/services/leave.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveApiResponse,LeaveTypeApiResponse } from '../models/leave.models';
import { LeaveBalanceApiResponse } from '../models/leave.models';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'https://localhost:7057/api/LeaveEntry'; // Update with your actual API URL
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Get leave details by email (matching your controller method)
  getLeavesByEmail(email: string): Observable<LeaveApiResponse> {
    return this.http.get<LeaveApiResponse>(
      `${this.apiUrl}/by-email/${email}`,
      this.httpOptions
    );
}
// Get all leave types
getLeaveTypes(): Observable<LeaveTypeApiResponse> {
  return this.http.get<LeaveTypeApiResponse>(
    `${this.apiUrl}/leave-types`,
    this.httpOptions
  );
}
getLeaveBalances(email: string, year: number): Observable<LeaveBalanceApiResponse> {
  return this.http.get<LeaveBalanceApiResponse>(
    `${this.apiUrl}/available-leaves?email=${email}&year=${year}`,
    this.httpOptions
  );
}
applyLeave(leaveData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/apply`, leaveData, this.httpOptions);
}

updateLeave(id: number, leaveData: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${id}`, leaveData, this.httpOptions);
}

deleteLeave(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/${id}`, this.httpOptions);
}



}