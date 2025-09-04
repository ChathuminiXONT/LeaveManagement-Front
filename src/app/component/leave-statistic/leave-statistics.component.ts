import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Needed for ngModel and *ngFor
  templateUrl: './leave-statistics.component.html',
  styleUrls: ['./leave-statistics.component.scss']
})
export class LeaveStatisticsComponent {
  selectedPeriod = 'Last 6 Months';
  statistics = [
    { type: 'Vacation', percentage: 45, color: 'vacation' },
    { type: 'Sick Leave', percentage: 30, color: 'sick' },
    { type: 'Personal', percentage: 15, color: 'personal' },
    { type: 'Other', percentage: 10, color: 'other' }
  ];
}
