import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true, // ✅ Make it standalone
  imports: [CommonModule], // ✅ Add CommonModule for *ngFor, *ngIf, etc.
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems = [
    { icon: 'tachometer-alt', label: 'Dashboard', active: true },
    { icon: 'list', label: 'Leave Requests', link: '/leave-requests' },
    { icon: 'calendar-plus', label: 'Request Leave' },
    { icon: 'users', label: 'Team Calendar' },
    { icon: 'chart-pie', label: 'Reports' },
    { icon: 'cog', label: 'Settings' }
  ];

  user = {
    name: 'Sarah Johnson',
    role: 'HR Manager',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  };
}
