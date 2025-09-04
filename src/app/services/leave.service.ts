import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../envirnments/environment'; // ✅ FIXED path
import { Observable } from 'rxjs';
import { CalenderDetail } from '../models/leave-detail.model';
export interface LeaveDetail {
  empEmailID: string;
  leaveStart: string; // e.g., "2025-08-10T09:00:00"
  leaveEnd: string;   // e.g., "2025-08-10T17:00:00"
  leaveType: 'vacation' | 'sick'; // already normalized
  approved: boolean;
  userName?: string; // optional: if backend returns the name
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/leave`;

  constructor(private http: HttpClient) {}

  // Fetch leaves by year and month
  getLeavesByMonth(year: number, month: number): Observable<CalenderDetail[]> {
    return this.http.get<CalenderDetail[]>(`${this.apiUrl}/month/${year}/${month}`);
  }
}
