import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../envirnments/environment';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  emailAddress: string;
  userName: string;
  departmentID: string;
  isActive: string;
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, request);
  }

  setUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  // ✅ Use backend-provided isAdmin flag
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin === true;
  }
}