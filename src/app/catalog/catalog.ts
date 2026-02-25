// src/app/catalog/catalog.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CatalogHeader } from '../catalog-header/catalog-header';
import { ProductService } from '../services/product.service';
import { CatalogProduct } from '../interfaces/product';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, CatalogHeader],
  templateUrl: './catalog.html',
  styleUrl:    './catalog.css',
})
export class Catalogo implements OnInit, AfterViewInit {

  @Input() drop:  'all' | 'drop01' | 'drop02' = 'all';
  @Input() title = 'Colección';

  private cart           = inject(CartService);
  private router         = inject(Router);
  private productService = inject(ProductService);

  private readonly dropRoutes: Record<string, string> = {
    drop01: '/drops/drop01',
    drop02: '/drops/drop02',
  };

  // ── Estado ─────────────────────────────────────────────────
  allProducts = signal<CatalogProduct[]>([]);
  loading     = signal(true);
  error       = signal<string | null>(null);

  gridView: '2col' | '4col' = '4col';

  sortOptions = [
    { label: 'Novedades',     value: 'new'        },
    { label: 'Precio: menor', value: 'price-asc'  },
    { label: 'Precio: mayor', value: 'price-desc' },
    { label: '% Descuento',   value: 'discount'   },
  ];
  activeSort   = 'new';
  sortOpen     = false;

  filters = [
    { label: 'Ver todo', value: 'all'     },
    { label: 'T-Shirts', value: 'tshirts' },
    { label: 'Hoodies',  value: 'hoodies' },
    { label: 'Sale',     value: 'sale'    },
    { label: 'Drop 01',  value: 'drop01'  },
    { label: 'Drop 02',  value: 'drop02'  },
  ];
  activeFilter = 'all';

  private selectedSizes  = new Map<string, string>();
  private selectedColors = new Map<string, string>();
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.initReveal();
  }

  // ── Carga desde API ────────────────────────────────────────
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts({ drop: this.drop }).subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loading.set(false);
        setTimeout(() => this.initReveal(), 60);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos.');
        this.loading.set(false);
      }
    });
  }

  // ── Productos filtrados y ordenados ───────────────────────
  get visibleProducts(): CatalogProduct[] {
    let list = this.allProducts();

    list = list.filter(p => {
      if (this.activeFilter === 'all')  return true;
      if (this.activeFilter === 'sale') return p.isSale;
      if (this.activeFilter === 'new')  return p.isNew;
      return p.cat === this.activeFilter;
    });

    switch (this.activeSort) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'discount':   return [...list].sort((a, b) => this.discount(b) - this.discount(a));
      default:           return [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
  }

  get visibleCount(): number { return this.visibleProducts.length; }

  // ── Stock helpers ──────────────────────────────────────────
  getStockForSize(p: CatalogProduct, size: string): number {
    const color = this.selectedColors.get(p.id) ?? null;
    return p.stock.find(s =>
      s.size === size && (color === null || s.color === color)
    )?.stock ?? 0;
  }

  isSizeAvailable(p: CatalogProduct, size: string): boolean {
    return this.getStockForSize(p, size) > 0;
  }

  // ── Selección ──────────────────────────────────────────────
  selectSize(pid: string, size: string, e: Event): void {
    e.stopPropagation();
    this.selectedSizes.set(pid, size);
  }

  selectColor(pid: string, color: string, e: Event): void {
    e.stopPropagation();
    this.selectedColors.set(pid, color);
    // Resetear talle si quedó sin stock con el nuevo color
    const size = this.selectedSizes.get(pid);
    const p    = this.allProducts().find(x => x.id === pid);
    if (size && p && !this.isSizeAvailable(p, size)) {
      this.selectedSizes.delete(pid);
    }
  }

  isSizeSelected(pid: string, size: string): boolean {
    return this.selectedSizes.get(pid) === size;
  }

  isColorSelected(pid: string, color: string): boolean {
    return this.selectedColors.get(pid) === color;
  }

  // ── Carrito ────────────────────────────────────────────────
  onAddClick(p: CatalogProduct, e: Event): void {
    e.stopPropagation();
    const size  = this.selectedSizes.get(p.id) ?? '';
    const color = this.selectedColors.get(p.id) ?? (p.colors[0]?.name ?? '');
    this.cart.add({ product: p.name, price: p.price, size, color, image: p.images[0] });
  }

  // ── Filtros / sort / vista ─────────────────────────────────
  setFilter(value: string): void {
    const route = this.dropRoutes[value];
    if (route) { this.router.navigateByUrl(route); return; }
    this.activeFilter = value;
    setTimeout(() => this.initReveal(), 60);
  }

  setSort(value: string): void           { this.activeSort = value; this.sortOpen = false; }
  toggleSort(): void                      { this.sortOpen = !this.sortOpen; }
  setGridView(v: '2col' | '4col'): void  { this.gridView = v; }

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
    const io  = new IntersectionObserver(entries => {
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
