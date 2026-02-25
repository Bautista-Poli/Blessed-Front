// src/app/catalog/catalog.ts
import {
  Component, OnInit, AfterViewInit,
  Input, inject, signal, computed,
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { CartService }    from '../services/cart.service';
import { CatalogHeader }  from '../catalog-header/catalog-header';
import { ProductService } from '../services/product.service';
import { FilterService }  from '../services/filter.service';
import { CatalogProduct } from '../interfaces/product';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, CatalogHeader],
  templateUrl: './catalog.html',
  styleUrl:    './catalog.css',
})
export class Catalogo implements OnInit, AfterViewInit {
  @Input() drop  = 'all';
  @Input() title = 'Colección';

  private cart           = inject(CartService);
  private productService = inject(ProductService);
  readonly fs            = inject(FilterService);  

  // ── Datos ──────────────────────────────────────────────────
  allProducts = signal<CatalogProduct[]>([]);
  loading     = signal(true);
  error       = signal<string | null>(null);

  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];
  private selectedSizes  = new Map<string, string>();
  private selectedColors = new Map<string, string>();

  // ── Productos filtrados y ordenados ───────────────────────
  get visibleProducts(): CatalogProduct[] {
    let list = this.allProducts();
    const f  = this.fs.activeFilter();

    list = list.filter(p => {
      if (f === 'all')  return true;
      if (f === 'sale') return p.isSale;
      if (f === 'new')  return p.isNew;
      return p.cat === f;
    });

    switch (this.fs.activeSort()) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'discount':   return [...list].sort((a, b) => this.discount(b) - this.discount(a));
      default:           return [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
  }

  get visibleCount(): number { return this.visibleProducts.length; }

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.fs.loadDrops();        // no-op si ya están cargados
    this.fs.resetFilter();
    this.loadProducts();
  }

  ngAfterViewInit(): void { this.initReveal(); }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getProducts({ drop: this.drop }).subscribe({
      next: products => {
        this.allProducts.set(products);
        this.loading.set(false);
        setTimeout(() => this.initReveal(), 60);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos.');
        this.loading.set(false);
      },
    });
  }

  // ── Carrito & Talles ───────────────────────────────────────
  getStockForSize(p: CatalogProduct, size: string): number {
    const color = this.selectedColors.get(p.id) ?? null;
    return p.stock.find(s => s.size === size && (color === null || s.color === color))?.stock ?? 0;
  }

  isSizeAvailable(p: CatalogProduct, size: string): boolean {
    return this.getStockForSize(p, size) > 0;
  }

  selectSize(pid: string, size: string, e: Event): void {
    e.stopPropagation();
    this.selectedSizes.set(pid, size);
  }

  selectColor(pid: string, color: string, e: Event): void {
    e.stopPropagation();
    this.selectedColors.set(pid, color);
    const size = this.selectedSizes.get(pid);
    const p    = this.allProducts().find(x => x.id === pid);
    if (size && p && !this.isSizeAvailable(p, size)) this.selectedSizes.delete(pid);
  }

  isSizeSelected(pid: string, size: string): boolean  { return this.selectedSizes.get(pid) === size; }
  isColorSelected(pid: string, color: string): boolean { return this.selectedColors.get(pid) === color; }

  onAddClick(p: CatalogProduct, e: Event): void {
    e.stopPropagation();
    const size  = this.selectedSizes.get(p.id)  ?? '';
    const color = this.selectedColors.get(p.id) ?? (p.colors[0]?.name ?? '');
    this.cart.add({ product: p.name, price: p.price, size, color, image: p.images[0] });
  }

  // ── Utils ──────────────────────────────────────────────────
  discount(p: CatalogProduct): number {
    if (!p.isSale || p.originalPrice === p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString('es-AR')}`;
  }

  private initReveal(): void {
    const els = document.querySelectorAll<HTMLElement>('.cat-card:not(.visible)');
    const io  = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => (e.target as HTMLElement).classList.add('visible'), i * 55);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.06 });
    els.forEach(el => io.observe(el));
  }
}