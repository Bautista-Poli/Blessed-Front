// src/app/services/checkout.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  id: string;
  product: string;
  price: number;
  quantity: number;
  size: string;
  color?: string;
  image?: string;
}

export interface CheckoutResponse {
  init_point: string; // URL de Mercado Pago
  sandbox_init_point: string;
  preference_id: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = 'https://blessed-back-production.up.railway.app/api';

  createPreference(items: CartItem[]): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, { items });
  }
}