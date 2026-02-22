import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CheckoutService } from './checkout.service';
import { CartService, CartItem } from '../../cart.service';

export interface ShippingOption {
  id: string;
  name: string;
  logo: string;
  description: string;
  estimatedDays: string;
  cost: number;
}

// ── Tarifas fijas por zona (reemplazar con API real después) ──
const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'oca_estandar',
    name: 'OCA',
    logo: 'OCA',
    description: 'Estándar a domicilio',
    estimatedDays: '3-5 días hábiles',
    cost: 0, // se calcula por zona
  },
  {
    id: 'correo_estandar',
    name: 'Correo Argentino',
    logo: 'CA',
    description: 'Estándar a domicilio',
    estimatedDays: '5-8 días hábiles',
    cost: 0,
  },
];

// Tarifas fijas por zona según CP
function calcularCosto(cp: string, transportista: string): number {
  const cpNum = parseInt(cp);
  // CABA y GBA
  if (cpNum >= 1000 && cpNum <= 1999) {
    return transportista === 'oca_estandar' ? 8500 : 6900;
  }
  // GBA zona 2
  if (cpNum >= 2000 && cpNum <= 2999) {
    return transportista === 'oca_estandar' ? 10500 : 8900;
  }
  // Interior
  return transportista === 'oca_estandar' ? 13500 : 11900;
}

type Step = 'contacto' | 'entrega' | 'pago';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private cartService     = inject(CartService);
  private router          = inject(Router);
  private fb              = inject(FormBuilder);

  items    = toSignal(this.cartService.items$, { initialValue: [] as CartItem[] });
  loading  = signal(false);
  error    = signal<string | null>(null);
  step     = signal<Step>('contacto');

  // Opciones de envío calculadas
  shippingOptions = signal<ShippingOption[]>([]);
  selectedShipping = signal<ShippingOption | null>(null);
  calculatingShipping = signal(false);

  // Formulario de contacto
  contactForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newsletter: [false],
  });

  // Formulario de entrega
  deliveryForm = this.fb.group({
    nombre:      ['', Validators.required],
    apellido:    ['', Validators.required],
    telefono:    ['', Validators.required],
    codigoPostal:['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    calle:       ['', Validators.required],
    numero:      ['', Validators.required],
    piso:        [''],
    depto:       [''],
    localidad:   ['', Validators.required],
    provincia:   ['', Validators.required],
  });

  total = computed(() =>
    this.items().reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
  );

  shippingCost = computed(() => this.selectedShipping()?.cost ?? 0);

  totalConEnvio = computed(() => this.total() + this.shippingCost());

  installments = computed(() => {
    const monto = this.totalConEnvio() / 3;
    return `3 cuotas sin interés de ${this.formatPrice(monto)}`;
  });

  steps: { id: Step; label: string }[] = [
    { id: 'contacto', label: 'Carrito' },
    { id: 'entrega',  label: 'Entrega' },
    { id: 'pago',     label: 'Pago' },
  ];

  ngOnInit() {
    if (this.items().length === 0) {
      this.router.navigate(['/']);
    }
  }

  getStepIndex(s: Step): number {
    return this.steps.findIndex(x => x.id === s);
  }

  isStepCompleted(s: Step): boolean {
    return this.getStepIndex(s) < this.getStepIndex(this.step());
  }

  // ── PASO 1: contacto ──────────────────────────────────────
  submitContacto() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.step.set('entrega');
  }

  // ── PASO 2: entrega ───────────────────────────────────────
  onCpChange() {
    const cp = this.deliveryForm.get('codigoPostal')?.value ?? '';
    if (cp.length === 4) {
      this.calcularEnvio(cp);
    } else {
      this.shippingOptions.set([]);
      this.selectedShipping.set(null);
    }
  }

  calcularEnvio(cp: string) {
    this.calculatingShipping.set(true);
    this.selectedShipping.set(null);

    // Simula delay de API
    setTimeout(() => {
      const opciones = SHIPPING_OPTIONS.map(opt => ({
        ...opt,
        cost: calcularCosto(cp, opt.id),
      }));
      this.shippingOptions.set(opciones);
      this.calculatingShipping.set(false);
    }, 800);
  }

  selectShipping(opt: ShippingOption) {
    this.selectedShipping.set(opt);
  }

  submitEntrega() {
    if (this.deliveryForm.invalid) {
      this.deliveryForm.markAllAsTouched();
      return;
    }
    if (!this.selectedShipping()) {
      this.error.set('Seleccioná un método de envío.');
      return;
    }
    this.error.set(null);
    this.step.set('pago');
  }

  // ── PASO 3: pago ──────────────────────────────────────────
  goToPayment() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    const shipping = this.selectedShipping()!;
    const delivery = this.deliveryForm.value;
    const contact  = this.contactForm.value;

    this.checkoutService.createPreference(this.items(), {
      email:    contact.email!,
      shipping: {
        cost:        shipping.cost,
        name:        shipping.name,
        address: {
          nombre:    delivery.nombre!,
          apellido:  delivery.apellido!,
          calle:     `${delivery.calle} ${delivery.numero}${delivery.piso ? ', ' + delivery.piso : ''}${delivery.depto ? ' ' + delivery.depto : ''}`,
          localidad: delivery.localidad!,
          provincia: delivery.provincia!,
          cp:        delivery.codigoPostal!,
          telefono:  delivery.telefono!,
        }
      }
    }).subscribe({
      next: (res) => {
        window.location.href = res.sandbox_init_point;
      },
      error: (err) => {
        console.error(err);
        this.error.set('Hubo un problema al procesar el pago. Intentá de nuevo.');
        this.loading.set(false);
      }
    });
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  }

  fieldError(form: any, field: string): boolean {
    const c = form.get(field);
    return c?.invalid && c?.touched;
  }

  goBack() {
    if (this.step() === 'entrega') this.step.set('contacto');
    else if (this.step() === 'pago') this.step.set('entrega');
  }
}