import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../services/cart.service';

type ResultStatus = 'success' | 'failure' | 'pending';

interface ResultConfig {
  icon:     string;
  title:    string;
  subtitle: string;
  btnLabel: string;
  btnRoute: string;
}

const RESULTS: Record<ResultStatus, ResultConfig> = {
  success: {
    icon:     '✓',
    title:    '¡Pago realizado!',
    subtitle: 'Tu pedido está confirmado. En breve vas a recibir un email con los detalles.',
    btnLabel: 'Seguir comprando',
    btnRoute: '/shop'
  },
  failure: {
    icon:     '✕',
    title:    'El pago no se pudo completar',
    subtitle: 'Hubo un problema con tu pago. Podés intentarlo de nuevo o elegir otro método.',
    btnLabel: 'Reintentar',
    btnRoute: '/checkout'
  },
  pending: {
    icon:     '⏳',
    title:    'Pago pendiente',
    subtitle: 'Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.',
    btnLabel: 'Volver al inicio',
    btnRoute: '/'
  }
};

@Component({
  selector: 'app-checkout-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-result.html',
  styleUrl:    './checkout-result.css'
})
export class CheckoutResultComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private cartService = inject(CartService);

  status = signal<ResultStatus>('pending');
  config = signal<ResultConfig>(RESULTS['pending']);

  // Datos opcionales que MP devuelve por query params
  paymentId    = signal<string | null>(null);
  merchantOrder = signal<string | null>(null);

  ngOnInit() {
    const url    = this.router.url;
    const params = this.route.snapshot.queryParamMap;

    // Determinar status según la ruta actual
    let status: ResultStatus = 'pending';
    if (url.includes('success')) status = 'success';
    if (url.includes('failure')) status = 'failure';

    this.status.set(status);
    this.config.set(RESULTS[status]);

    // Guardar datos de la transacción (útiles para soporte)
    this.paymentId.set(params.get('payment_id'));
    this.merchantOrder.set(params.get('merchant_order_id'));

    // Si el pago fue exitoso, limpiamos el carrito
    if (status === 'success') {
      this.cartService.clear();
    }
  }

  navigate() {
    this.router.navigate([this.config().btnRoute]);
  }
}
