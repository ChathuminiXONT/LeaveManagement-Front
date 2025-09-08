import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest, User } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Prevent showing login if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    const request: LoginRequest = { email: this.email, password: this.password };

    this.authService.login(request).subscribe({
      next: (user: User) => {
        this.authService.setUser(user);
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: () => {
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
}