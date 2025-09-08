import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../envirnments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    // Load user from localStorage if exists
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(user => this.setUser(user))
    );
  }

  setUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin === true;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }
}