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
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api'; // cambiá por tu URL de producción

  createPreference(items: CartItem[]): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, { items });
  }
}