import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  notificationCount = 3;
  currentPage = 'Dashboard';

  constructor(private router: Router) {}

  navigateTo(page: string) {
    if (page === 'dashboard') {
      this.currentPage = 'Dashboard';
      this.router.navigate(['/dashboard']);
    } else if (page === 'leave-approval') {
      this.currentPage = 'Leave Approval';
      this.router.navigate(['/leave-approval']);
    }
  }
}
