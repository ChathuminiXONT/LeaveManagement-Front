import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { AuthService, User } from '../../services/auth.service';
import { CalenderDetail } from '../../models/leave-detail.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday?: boolean;
  leaves?: CalenderDetail[];
}

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-calendar.component.html',
  styleUrls: ['./team-calendar.component.scss']
})
export class TeamCalendarComponent implements OnInit {
  currentDate: Date = new Date();
  today: Date = new Date();
  days: CalendarDay[] = [];
  loading = false;
  error = '';
  selectedDay?: CalendarDay;
  loggedInDepartmentID?: string;

  constructor(private leaveService: LeaveService, private authService: AuthService) {}

  ngOnInit() {
    const currentUser: User | null = this.authService.getUser();
    this.loggedInDepartmentID = currentUser?.departmentID;
    this.fetchLeaves();
  }

  fetchLeaves() {
    this.loading = true;
    this.error = '';
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    this.leaveService.getLeavesByMonth(year, month).subscribe({
      next: (leaves: CalenderDetail[]) => {
        this.generateCalendar(leaves);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching leaves', err);
        this.error = 'Failed to load leave data';
        this.generateCalendar([]);
        this.loading = false;
      }
    });
  }

  generateCalendar(leaves: CalenderDetail[]) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const calendar: CalendarDay[] = [];

    // Previous month placeholders
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = new Date(year, month, i - startDayOfWeek + 1);
      calendar.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        leaves: this.getLeavesForDate(date, leaves)
      });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      calendar.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        leaves: this.getLeavesForDate(date, leaves)
      });
    }

    // Next month placeholders
    const remainingCells = 42 - calendar.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      calendar.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        leaves: this.getLeavesForDate(date, leaves)
      });
    }

    this.days = calendar;
  }

  getLeavesForDate(date: Date, leaves: CalenderDetail[]): CalenderDetail[] {
    return leaves.filter(l => {
      const start = new Date(l.leaveStart);
      const end = new Date(l.leaveEnd);
      return date >= start && date <= end;
    });
  }

  isToday(date: Date) {
    return date.getFullYear() === this.today.getFullYear() &&
           date.getMonth() === this.today.getMonth() &&
           date.getDate() === this.today.getDate();
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.fetchLeaves();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.fetchLeaves();
  }

  getMonthYear(): string {
    return this.currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  }

  openDayDetails(day: CalendarDay) {
    this.selectedDay = day;
  }

  closeModal() {
    this.selectedDay = undefined;
  }

  isSameDepartmentLeave(day: CalendarDay): boolean {
    return day.leaves?.some(l => l.departmentID === this.loggedInDepartmentID) ?? false;
  }

  isOtherDepartmentLeave(day: CalendarDay): boolean {
    return day.leaves?.some(l => l.departmentID !== this.loggedInDepartmentID) ?? false;
  }
}
