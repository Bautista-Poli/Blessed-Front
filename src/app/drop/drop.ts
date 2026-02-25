import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { Router, RouterModule }   from '@angular/router';
import { CartService }    from '../services/cart.service';
import { CatalogHeader }  from '../catalog-header/catalog-header';
import { Subscription, map } from 'rxjs';
import { DropConfig } from '../interfaces/drop';
import { CatalogProduct } from '../interfaces/product';

@Component({
  selector: 'app-drop-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, CatalogHeader],
  templateUrl: './drop.html',
  styleUrl:    './drop.css',
})
export class Drop implements OnInit, AfterViewInit, OnDestroy {

  @Input() config!: DropConfig;
  @Input() products: CatalogProduct[] = [];
  
  // ── Estado de UI ───────────────────────────────────────────
  activeFilter = 'all';
  gridView: '2col' | '4col' = '4col';
  activeSort = 'new';
  sortOpen   = false;
  cartCount  = 0;
  heroVisible = false;

  private subs = new Subscription();
  private revealObserver?: IntersectionObserver;

  // ── Configuración del Header ───────────────────────────────
  sortOptions = [
    { label: 'Novedades',     value: 'new'       },
    { label: 'Precio: menor', value: 'price-asc' },
    { label: 'Precio: mayor', value: 'price-desc'},
  ];

  filters = [
    { label: 'Ver todo', value: 'all'     },
    { label: 'Drop 01',  value: 'drop01'  },
    { label: 'Drop 02',  value: 'drop02'  },
  ];

  // ── Mapeo de navegación al catálogo ────────────────────────
  // Al hacer clic en estos filtros desde el DROP, volvemos al catálogo
  private readonly navigationRoutes: Record<string, string> = {
    all:    '/catalog',
    drop01: '/drops/drop01',
    drop02: '/drops/drop02',
  };

  constructor(
    private cart:   CartService,
    private cdr:    ChangeDetectorRef,
    private router: Router,
  ) {}

  // ── Lógica de Productos Ordenados ──────────────────────────
  get orderedProducts(): CatalogProduct[] {
    const list = [...this.products];
    switch (this.activeSort) {
      case 'price-asc':  return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      default:           return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
  }

  get itemCount(): number { return this.products.length; }

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    if (this.config) {
      document.documentElement.style.setProperty('--drop-accent', this.config.accent_color);
    }

    // Suscripción al carrito para el counter del header
    this.subs.add(
      this.cart.items$
        .pipe(map(items => items.reduce((sum, i) => sum + i.quantity, 0)))
        .subscribe(count => { this.cartCount = count; })
    );
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.heroVisible = true;
        this.cdr.detectChanges();
        this.initScrollReveal();
      });
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.subs.unsubscribe();
    document.documentElement.style.removeProperty('--drop-accent');
  }

  // ── Header Handlers ────────────────────────────────────────
  setFilter(value: string): void {
    const route = this.navigationRoutes[value];
    if (route) {
      this.router.navigateByUrl(route); // ← navigateByUrl en vez de navigate con queryParams
      return;
    }
    this.activeFilter = value;
    setTimeout(() => this.initReveal(), 60);
  }

  setSort(value: string): void { 
    this.activeSort = value; 
    this.sortOpen = false; 
  }

  toggleSort(): void { 
    this.sortOpen = !this.sortOpen; 
  }

  setGridView(v: '2col' | '4col'): void { 
    this.gridView = v; 
  }

  toggleCart(): void {
    this.cart.toggle();
  }

  // ── Carrito & Talles ───────────────────────────────────────
  private selectedSizes = new Map<string, string>();
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];

  selectSize(pid: string, size: string, e: Event): void {
    e.stopPropagation();
    this.selectedSizes.set(pid, size);
  }

  isSizeSelected(pid: string, size: string): boolean {
    return this.selectedSizes.get(pid) === size;
  }

  onAddClick(p: CatalogProduct, e: Event): void {
    e.stopPropagation();
    const size = this.selectedSizes.get(p.id) ?? '';
    this.cart.add({ product: p.name, price: p.price, size, image: p.images[0] });
  }

  // ── Helpers ────────────────────────────────────────────────
  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-AR')}`;
  }

  discount(p: CatalogProduct): number {
    if (!p.isSale || p.originalPrice === p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  // ── Animaciones ────────────────────────────────────────────
  private initScrollReveal(): void {
    this.revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('visible');
            this.revealObserver?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll<HTMLElement>('.drop-reveal')
      .forEach(el => this.revealObserver!.observe(el));
  }

  private initReveal(): void {
    const els = document.querySelectorAll<HTMLElement>('.cat-card:not(.visible)');
    els.forEach(el => el.classList.add('visible'));
  }
}
