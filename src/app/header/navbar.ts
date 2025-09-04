import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  showDropdown = false;
  currentUser: User | null = null;

  constructor(private router: Router, private authService: AuthService) {
    this.loadCurrentUser();

    // Update currentUser on every route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadCurrentUser();
      }
    });
  }

  loadCurrentUser() {
    this.currentUser = this.authService.getUser();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.authService.logout();
    this.showDropdown = false; // close dropdown after logout
    this.router.navigate(['/login']);
  }

  shouldShowNavbar(): boolean {
    const hiddenRoutes = ['/', '/login'];
    return !hiddenRoutes.includes(this.router.url);
  }

  showLeaveApproval(): boolean {
    // ✅ now relies on backend-provided isAdmin
    return this.authService.isAdmin();
  }

  // Close dropdown if user clicks outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-info') && !target.closest('.profile-dropdown')) {
      this.showDropdown = false;
    }
  }
}