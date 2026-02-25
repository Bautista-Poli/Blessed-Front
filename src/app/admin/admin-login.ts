import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminLogin {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  error = signal(false);

  form = this.fb.group({
    user: ['', Validators.required],
    pass: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    const { user, pass } = this.form.value;
    const ok = this.auth.login(user!, pass!);
    if (ok) this.router.navigate(['/admin/panel']);
    else this.error.set(true);
  }
}
