// src/app/inicio/inicio.ts
import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core'; // Añadimos signal y ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { IgCarousel } from '../ig-carousel/ig-carousel';
import { CartService } from '../../cart.service';
import { CartDrawer } from '../cart-drawer/cart-drawer';
import { ProductService, CatalogProduct } from '../../product.service'; // Importamos el servicio de productos

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, IgCarousel, RouterLink, CartDrawer],
  templateUrl: './inicio.html',
  styleUrls: [
    './inicio.css',
    './inicio2.css'
  ],
})
export class Inicio implements OnInit, OnDestroy {
  private cartService    = inject(CartService);
  private productService = inject(ProductService);
  private cdr            = inject(ChangeDetectorRef);

  // ── ESTADO DE PRODUCTOS DEL BACKEND ──
  featuredProducts = signal<CatalogProduct[]>([]);
  loadingProducts  = signal(true);

  // ── ESTADO LOCAL ──
  announceVisible   = true;
  mobileMenuOpen    = false;
  navScrolled       = false;
  newsletterEmail   = '';
  newsletterLoading = false;
  newsletterDone    = false;
  heroPanelHovered: 'left' | 'right' | null = null;
  toastMessage = '';
  toastVisible = false;

  // Mapas para manejar selección de múltiples productos en la misma pantalla
  private selectedSizes  = new Map<string, string>();
  private selectedColors = new Map<string, string>();

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollListener!: () => void;

  get cartCount(): number { return this.cartService.count; }

  ngOnInit(): void {
    this.loadFeaturedProducts(); // Cargar productos al iniciar
    this.initScrollReveal();
    this.initNavbarScroll();
    this.initSmoothScroll();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  // ── CARGA DE PRODUCTOS ──────────────────────────────────────
  loadFeaturedProducts(): void {
    this.loadingProducts.set(true);
    this.productService.getProducts({ drop: 'all' }).subscribe({
      next: (products) => {
        this.featuredProducts.set(products.slice(0, 2)); 
        this.loadingProducts.set(false);
        setTimeout(() => this.initScrollReveal(), 100);
        
        this.cdr.detectChanges();
      },
      error: () => this.loadingProducts.set(false)
    });
  }

  // ── CARRITO ACTUALIZADO ─────────────────────────────────────
  
  // Este método ahora es genérico para cualquier producto en el inicio
  addToCart(product: CatalogProduct): void {
    const size = this.selectedSizes.get(product.id);
    const color = this.selectedColors.get(product.id) || (product.colors[0]?.name || '');

    if (!size) {
      this.showToast('Seleccioná un talle');
      return;
    }

    this.cartService.add({
      product: product.name,
      price: product.price,
      size: size,
      color: color,
      image: product.images[0]
    });

    this.showToast(`${product.name} agregado al carrito`);
    this.cartService.open(); // Opcional: abrir el carrito al agregar
  }

  // ── MANEJO DE SELECCIÓN ─────────────────────────────────────
  
  selectSize(productId: string, size: string): void {
    this.selectedSizes.set(productId, size);
  }

  isSizeSelected(productId: string, size: string): boolean {
    return this.selectedSizes.get(productId) === size;
  }

  // ══════════════════════════════════════════════════════════
  //  MÉTODOS UI (TOAST, SCROLL, ETC.) - Se mantienen igual
  // ══════════════════════════════════════════════════════════

  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 2800);
  }

  closeAnnouncement(): void {
    this.announceVisible = false;
    document.documentElement.style.setProperty('--announce-height', '0px');
  }

  private initNavbarScroll(): void {
    this.scrollListener = () => { this.navScrolled = window.scrollY > 60; };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  onHeroPanelEnter(side: 'left' | 'right'): void { this.heroPanelHovered = side; }
  onHeroPanelLeave(): void                        { this.heroPanelHovered = null; }

  onNewsletterSubmit(): void {
    if (!this.newsletterEmail) return;
    this.newsletterLoading = true;
    setTimeout(() => {
      this.newsletterLoading = false;
      this.newsletterDone    = true;
      this.newsletterEmail   = '';
      this.showToast('¡Bienvenido al crew!');
      setTimeout(() => { this.newsletterDone = false; }, 3000);
    }, 800);
  }

  private initScrollReveal(): void {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el    = entry.target as HTMLElement;
            const delay = parseInt(el.dataset['delay'] ?? '0', 10);
            setTimeout(() => el.classList.add('visible'), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    elements.forEach(el => observer.observe(el));
  }

  private initSmoothScroll(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 80, // Ajuste fijo aproximado de nav
          behavior: 'smooth',
        });
      });
    });
  }
  

  // Este es el método que te faltaba
  getHeroPanelFlex(side: 'left' | 'right'): string {
    if (!this.heroPanelHovered) return '1';
    return this.heroPanelHovered === side ? '1.15' : '0.85';
  }
  onEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cartService.close();
      this.closeMobileMenu();
    }
  }

  // ── CART ACTIONS ──
  openCart(): void {
    this.cartService.open();
  }

  closeCart(): void {
    this.cartService.close();
  }

  formatPrice(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }
}
