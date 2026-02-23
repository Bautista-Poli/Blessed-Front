// src/app/admin/auth.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ADMIN_USER = 'admin';
  private readonly ADMIN_PASS = 'blessed2025';

  isAuthenticated = signal(false);

  constructor() {
    this.isAuthenticated.set(sessionStorage.getItem('admin_auth') === 'true');
  }

  login(user: string, pass: string): boolean {
    if (user === this.ADMIN_USER && pass === this.ADMIN_PASS) {
      this.isAuthenticated.set(true);
      sessionStorage.setItem('admin_auth', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    sessionStorage.removeItem('admin_auth');
  }
}