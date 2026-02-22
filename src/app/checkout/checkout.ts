import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CheckoutService } from './checkout.service';
import { CartService, CartItem } from '../../cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})

export class CheckoutComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private cartService     = inject(CartService);
  private router          = inject(Router);

  // Convierte el BehaviorSubject en Signal para usar con computed()
  items = toSignal(this.cartService.items$, { initialValue: [] as CartItem[] });

  loading = signal(false);
  error   = signal<string | null>(null);

  total = computed(() =>
    this.items().reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
  );

  installments = computed(() => {
    const cuotas = 3;
    const monto  = this.total() / cuotas;
    return `${cuotas} cuotas sin interés de ${this.formatPrice(monto)}`;
  });

  ngOnInit() {
    if (this.items().length === 0) {
      this.router.navigate(['/shop']);
    }
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  }

  goToPayment() {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.checkoutService.createPreference(this.items()).subscribe({
      next: (res) => {
        //window.location.href = res.init_point;
        window.location.href = res.sandbox_init_point;
      },
      error: (err) => {
        console.error(err);
        this.error.set('Hubo un problema al procesar el pago. Intentá de nuevo.');
        this.loading.set(false);
      }
    });
  }
}