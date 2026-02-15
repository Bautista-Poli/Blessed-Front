// src/app/inicio/inicio.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AddToCartEvent, BigItemForIndex } from '../big-item-for-index/big-item-for-index';
import { IgCarousel } from '../ig-carousel/ig-carousel';
import { CartService } from '../../cart.service';
import { CartDrawer } from '../cart-drawer/cart-drawer';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, BigItemForIndex, IgCarousel, RouterLink, CartDrawer],
  // ↑ CartDrawer se saca de aquí — vive en app.html una sola vez
  templateUrl: './inicio.html',
  styleUrls: [
    './inicio.css',        // Tu archivo original/base
    './inicio2.css' // El nuevo archivo separado
  ],
})
export class Inicio implements OnInit, OnDestroy {

  // ── ESTADO LOCAL (solo lo que pertenece a esta pantalla) ──
  announceVisible   = true;
  mobileMenuOpen    = false;
  navScrolled       = false;
  newsletterEmail   = '';
  newsletterLoading = false;
  newsletterDone    = false;
  heroPanelHovered: 'left' | 'right' | null = null;
  toastMessage = '';
  toastVisible = false;

  private selectedSizes = new Map<string, string>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollListener!: () => void;

  // ── CONSTRUCTOR: inyectá CartService ──────────────────────
  constructor(private cartService: CartService) {}

  // ── GETTER del badge del navbar ───────────────────────────
  get cartCount(): number { return this.cartService.count; }

  // ── LIFECYCLE ─────────────────────────────────────────────
  ngOnInit(): void {
    this.initScrollReveal();
    this.initNavbarScroll();
    this.initSmoothScroll();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollListener);
  }

  // ══════════════════════════════════════════════════════════
  //  CARRITO — delegado al CartService
  // ══════════════════════════════════════════════════════════

  openCart(): void  { this.cartService.open();  }
  closeCart(): void { this.cartService.close(); }

  addToCart(product: string, price: number, size: string): void {
    if (!size) {
      this.showToast('Seleccioná un talle');
      return;
    }
    this.cartService.add({ product, price, size });
    this.showToast(`${product} — Talle ${size} agregado`);
  }

  // Recibe el evento de <app-big-item-for-index>
  onFeatureAddToCart(event: AddToCartEvent): void {
    this.addToCart(event.product, event.price, event.size);
  }

  // ── TALLE ──────────────────────────────────────────────────
  selectSize(groupKey: string, size: string): void {
    this.selectedSizes.set(groupKey, size);
  }

  isSizeSelected(groupKey: string, size: string): boolean {
    return this.selectedSizes.get(groupKey) === size;
  }

  // ══════════════════════════════════════════════════════════
  //  TOAST
  // ══════════════════════════════════════════════════════════

  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 2800);
  }

  // ══════════════════════════════════════════════════════════
  //  ANNOUNCEMENT BAR
  // ══════════════════════════════════════════════════════════

  closeAnnouncement(): void {
    this.announceVisible = false;
    document.documentElement.style.setProperty('--announce-height', '0px');
  }

  // ══════════════════════════════════════════════════════════
  //  NAVBAR SCROLL
  // ══════════════════════════════════════════════════════════

  private initNavbarScroll(): void {
    this.scrollListener = () => { this.navScrolled = window.scrollY > 60; };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  // ══════════════════════════════════════════════════════════
  //  MOBILE MENU
  // ══════════════════════════════════════════════════════════

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  // ══════════════════════════════════════════════════════════
  //  KEYBOARD ESC
  // ══════════════════════════════════════════════════════════

  onEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.cartService.close();
  }

  // ══════════════════════════════════════════════════════════
  //  HERO PANELS
  // ══════════════════════════════════════════════════════════

  onHeroPanelEnter(side: 'left' | 'right'): void { this.heroPanelHovered = side; }
  onHeroPanelLeave(): void                        { this.heroPanelHovered = null; }

  getHeroPanelFlex(side: 'left' | 'right'): string {
    if (!this.heroPanelHovered) return '1';
    return this.heroPanelHovered === side ? '1.15' : '0.85';
  }

  // ══════════════════════════════════════════════════════════
  //  NEWSLETTER
  // ══════════════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════════════
  //  SCROLL REVEAL
  // ══════════════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════════════
  //  SMOOTH SCROLL
  // ══════════════════════════════════════════════════════════

  private initSmoothScroll(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10
        );
        const annH = this.announceVisible
          ? parseInt(
              getComputedStyle(document.documentElement).getPropertyValue('--announce-height'), 10
            )
          : 0;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - navH - annH,
          behavior: 'smooth',
        });
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  //  UTILS
  // ══════════════════════════════════════════════════════════

  formatPrice(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }
}


