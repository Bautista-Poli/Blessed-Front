import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddToCartEvent, BigItemForIndex } from '../big-item-for-index/big-item-for-index';
import { IgCarousel } from '../ig-carousel/ig-carousel';

// ── INTERFACES ────────────────────────────────────────────────
interface CartItem {
  id: string;
  product: string;
  size: string;
  price: number;
  quantity: number;
}

// ── COMPONENTE ────────────────────────────────────────────────
@Component({
  selector: 'app-inicio',
  imports: [CommonModule, FormsModule, BigItemForIndex, IgCarousel],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit, OnDestroy {

  // ── ESTADO ────────────────────────────────────────────────
  cart: CartItem[] = [];
  announceVisible = true;
  selectedSizes = new Map<string, string>();
  cartOpen = false;
  mobileMenuOpen = false;
  navScrolled = false;
  newsletterEmail = '';

  // ── FILTROS ───────────────────────────────────────────────
  filters = [
    { label: 'Todo',      value: 'all'       },
    { label: 'T-Shirts',  value: 'tshirts'   },
    { label: 'Hoodies',   value: 'hoodies'   },
    { label: 'Crewnecks', value: 'crewnecks' },
  ];

  // ── PRODUCTOS ─────────────────────────────────────────────
  // Reemplazá las rutas de image con los nombres reales de tus archivos
  products = [
    {
      id: 'p1', cat: 'hoodies',   delay: 0,
      name: '"SQ" HOODIE',
      price: 51000, originalPrice: 85000, badge: '−40%',
      image: 'assets/Products/Product 2/product2.webp',
    },
    {
      id: 'p2', cat: 'tshirts',   delay: 80,
      name: '"BLES SED" TEE',
      price: 29900, originalPrice: 46000, badge: '−35%',
      image: 'assets/Products/Product 2/product2.webp',
    },
    {
      id: 'p3', cat: 'crewnecks', delay: 160,
      name: '"ESSENTIAL" CREWNECK',
      price: 45000, originalPrice: 75000, badge: '−40%',
      image: 'assets/Products/Product 2/product2.webp',
    },
    {
      id: 'p4', cat: 'tshirts',   delay: 240,
      name: '"SQ WHITE" TEE',
      price: 29900, originalPrice: 46000, badge: '−35%',
      image: 'assets/Products/Product 2/product2.webp',
    },
    {
      id: 'p5', cat: 'tshirts',   delay: 320,
      name: '"GRAFFI-TEE"',
      price: 27600, originalPrice: 46000, badge: '−40%',
      image: 'assets/Products/Product 2/product2.webp',
    },
    {
      id: 'p6', cat: 'crewnecks', delay: 400,
      name: '"BB" CREWNECK',
      price: 45000, originalPrice: 75000, badge: '−40%',
      image: 'assets/Products/Product 2/product2.webp',
    },
  ];

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollListener!: () => void;

  // ── LIFECYCLE ─────────────────────────────────────────────
  ngOnInit(): void {
    this.initScrollReveal();
    this.initNavbarScroll();
    this.initHeroPanels();
    this.initSmoothScroll();
    // Espera a que Angular renderice el @for del carrusel
    setTimeout(() => this.initIgCarousel(), 0);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollListener);
  }

  // ══════════════════════════════════════════════════════════
  //  UTILS
  // ══════════════════════════════════════════════════════════

  formatPrice(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 9);
  }

  private cartItemKey(product: string, size: string): string {
    return `${product}__${size}`;
  }

  // ══════════════════════════════════════════════════════════
  //  TOAST
  // ══════════════════════════════════════════════════════════

  toastMessage = '';
  toastVisible = false;

  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 2800);
  }

  // ══════════════════════════════════════════════════════════
  //  CARRITO
  // ══════════════════════════════════════════════════════════

  get cartCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get cartInstallments(): string {
    if (this.cart.length === 0) return '';
    return `3 cuotas sin interés de ${this.formatPrice(Math.round(this.cartTotal / 3))}`;
  }

  addToCart(product: string, price: number, size: string): void {
    if (!size) {
      this.showToast('Seleccioná un talle');
      return;
    }

    const key = this.cartItemKey(product, size);
    const existing = this.cart.find(
      i => this.cartItemKey(i.product, i.size) === key
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart = [
        ...this.cart,
        { id: this.generateId(), product, price, size, quantity: 1 },
      ];
    }

    this.openCart();
    this.showToast(`${product} — Talle ${size} agregado`);
  }
  // inicio.ts — agregás este método
  onFeatureAddToCart(event: AddToCartEvent): void {
    this.addToCart(event.product, event.price, event.size);
  }
  removeFromCart(id: string): void {
    this.cart = this.cart.filter(item => item.id !== id);
  }

  // ── Llamado desde el botón de producto en el HTML ─────────
  onAddFromCard(product: string, price: number, cardKey: string): void {
    const size = this.selectedSizes.get(cardKey) ?? '';
    this.addToCart(product, price, size);
  }

  // ── Llamado desde la sección feature ──────────────────────
  onAddFeature(): void {
    const size = this.selectedSizes.get('feature') ?? '';
    this.addToCart('SQ Hoodie', 51000, size);
  }

  // ══════════════════════════════════════════════════════════
  //  CART DRAWER
  // ══════════════════════════════════════════════════════════

  openCart(): void {
    this.cartOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCart(): void {
    this.cartOpen = false;
    document.body.style.overflow = '';
  }

  onOverlayClick(): void {
    this.closeCart();
  }

  onEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeCart();
  }

  // ══════════════════════════════════════════════════════════
  //  SELECCIÓN DE TALLE
  // ══════════════════════════════════════════════════════════

  selectSize(groupKey: string, size: string): void {
    this.selectedSizes.set(groupKey, size);
  }

  isSizeSelected(groupKey: string, size: string): boolean {
    return this.selectedSizes.get(groupKey) === size;
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
    this.scrollListener = () => {
      this.navScrolled = window.scrollY > 60;
    };
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
  //  SHOP FILTER
  // ══════════════════════════════════════════════════════════

  activeFilter = 'all';

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  isProductVisible(cat: string): boolean {
    return this.activeFilter === 'all' || this.activeFilter === cat;
  }

  // ══════════════════════════════════════════════════════════
  //  NEWSLETTER
  // ══════════════════════════════════════════════════════════

  newsletterLoading = false;
  newsletterDone = false;

  onNewsletterSubmit(): void {
    if (!this.newsletterEmail) return;

    this.newsletterLoading = true;

    // Acá reemplazás con la llamada real al backend Node.js:
    // this.http.post('/api/newsletter', { email: this.newsletterEmail })
    setTimeout(() => {
      this.newsletterLoading = false;
      this.newsletterDone = true;
      this.newsletterEmail = '';
      this.showToast('¡Bienvenido al crew!');

      setTimeout(() => {
        this.newsletterDone = false;
      }, 3000);
    }, 800);
  }

  // ══════════════════════════════════════════════════════════
  //  SCROLL REVEAL
  // ══════════════════════════════════════════════════════════

  private initScrollReveal(): void {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset['delay'] ?? '0', 10);

            setTimeout(() => {
              el.classList.add('visible');
            }, delay);

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  // ══════════════════════════════════════════════════════════
  //  HERO PANELS
  // ══════════════════════════════════════════════════════════

  heroPanelHovered: 'left' | 'right' | null = null;

  onHeroPanelEnter(side: 'left' | 'right'): void {
    this.heroPanelHovered = side;
  }

  onHeroPanelLeave(): void {
    this.heroPanelHovered = null;
  }

  getHeroPanelFlex(side: 'left' | 'right'): string {
    if (!this.heroPanelHovered) return '1';
    return this.heroPanelHovered === side ? '1.15' : '0.85';
  }

  // ══════════════════════════════════════════════════════════
  //  CARRUSEL INSTAGRAM
  // ══════════════════════════════════════════════════════════

  

  private igOffset = 0;
  private igDragging = false;
  private igStartX = 0;
  private igScrollStart = 0;

  initIgCarousel(): void {
    const wrap  = document.querySelector<HTMLElement>('.ig-track-wrap');
    const track = document.querySelector<HTMLElement>('.ig-track');
    if (!wrap || !track) return;

    const getMax = () => -(track.scrollWidth - wrap.clientWidth);

    wrap.addEventListener('mousedown', (e: MouseEvent) => {
      this.igDragging    = true;
      this.igStartX      = e.pageX;
      this.igScrollStart = this.igOffset;
      wrap.classList.add('dragging');
    });
    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.igDragging) return;
      const d = e.pageX - this.igStartX;
      this.igOffset = Math.min(0, Math.max(getMax(), this.igScrollStart + d));
      track.style.transform = `translateX(${this.igOffset}px)`;
    });
    window.addEventListener('mouseup', () => {
      this.igDragging = false;
      wrap.classList.remove('dragging');
    });
    wrap.addEventListener('touchstart', (e: TouchEvent) => {
      this.igStartX      = e.touches[0].pageX;
      this.igScrollStart = this.igOffset;
    }, { passive: true });
    wrap.addEventListener('touchmove', (e: TouchEvent) => {
      const d = e.touches[0].pageX - this.igStartX;
      this.igOffset = Math.min(0, Math.max(getMax(), this.igScrollStart + d));
      track.style.transform = `translateX(${this.igOffset}px)`;
    }, { passive: true });
  }

  igScrollBy(direction: 'prev' | 'next'): void {
    const wrap  = document.querySelector<HTMLElement>('.ig-track-wrap');
    const track = document.querySelector<HTMLElement>('.ig-track');
    if (!wrap || !track) return;

    const step = wrap.clientWidth * 0.75;
    const max  = -(track.scrollWidth - wrap.clientWidth);

    this.igOffset = direction === 'next'
      ? Math.max(max, this.igOffset - step)
      : Math.min(0,   this.igOffset + step);

    track.style.transition = 'transform .5s cubic-bezier(0.16,1,0.3,1)';
    track.style.transform  = `translateX(${this.igOffset}px)`;
    setTimeout(() => { track.style.transition = ''; }, 520);
  }
  private initHeroPanels(): void {
    // Añadimos <HTMLElement> aquí 👇
    const panels = document.querySelectorAll<HTMLElement>('.hero-panel'); 
    
    panels.forEach(panel => {
        panel.addEventListener('mouseenter', () => {
            panels.forEach(p => {
                if (p !== panel) {
                    p.style.flex = '0.85';
                }
            });
            panel.style.flex = '1.15';
        });
        panel.addEventListener('mouseleave', () => {
            panels.forEach(p => {
                p.style.flex = '';
            });
        });
    });
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
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
          10
        );
        const annH = this.announceVisible
          ? parseInt(
              getComputedStyle(document.documentElement).getPropertyValue('--announce-height'),
              10
            )
          : 0;

        const offset =
          target.getBoundingClientRect().top + window.scrollY - navH - annH;

        window.scrollTo({ top: offset, behavior: 'smooth' });
      });
    });
  }
}


