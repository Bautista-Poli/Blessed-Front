// src/app/catalog/catalog.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../cart.service';
import { CatalogHeader } from '../catalog-header/catalog-header';

export interface CatalogProduct {
  id:            string;
  cat:           string;
  drop:          'drop01' | 'drop02' | 'all';
  name:          string;
  price:         number;
  originalPrice: number;
  isNew:         boolean;
  isSale:        boolean;
  image:         string;
  imageHover?:   string;
}

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

  // ── Pills que son navegación, no filtros ──────────────────
  // Clave: valor del filtro → ruta a navegar
  // Ajustá las rutas si las tuyas son distintas
  private readonly dropRoutes: Record<string, string> = {
    drop01: '/drop1',
    drop02: '/drop2',
  };

  constructor(
    private cart:   CartService,
    private router: Router,
  ) {}

  // ── Vista ──────────────────────────────────────────────────
  gridView: '2col' | '4col' = '4col';

  // ── Ordenamiento ───────────────────────────────────────────
  sortOptions = [
    { label: 'Novedades',     value: 'new'       },
    { label: 'Precio: menor', value: 'price-asc' },
    { label: 'Precio: mayor', value: 'price-desc'},
    { label: '% Descuento',   value: 'discount'  },
  ];
  activeSort = 'new';
  sortOpen   = false;

  // ── Filtros pill ───────────────────────────────────────────
  // Drop01 y Drop02 tienen value 'drop01'/'drop02' → se capturan
  // en setFilter y navegan en vez de filtrar
  filters = [
    { label: 'Ver todo', value: 'all'     },
    { label: 'T-Shirts', value: 'tshirts' },
    { label: 'Hoodies',  value: 'hoodies' },
    { label: 'Sale',     value: 'sale'    },
    { label: 'Drop 01',  value: 'drop01'  },
  ];
  activeFilter = 'all';

  // ── Talles ─────────────────────────────────────────────────
  private selectedSizes = new Map<string, string>();
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];

  // ── Productos ─────────────────────────────────────────────
  allProducts: CatalogProduct[] = [
    {
      id: 'p01', drop: 'drop02', cat: 'hoodies', isNew: true, isSale: true,
      name: '"SQ" HOODIE', price: 51000, originalPrice: 85000,
      image:      'assets/Products/Product 2/product2-3.webp',
      imageHover: 'assets/Products/Product 2/product2.webp',
    },
    {
      id: 'p02', drop: 'drop02', cat: 'tshirts', isNew: true, isSale: true,
      name: '"BLES SED" TEE', price: 29900, originalPrice: 46000,
      image:      'assets/Products/Product 1/product1-4.webp',
      imageHover: 'assets/Products/Product 1/product1-5.webp',
    },
    {
      id: 'p03', drop: 'drop02', cat: 'crewnecks', isNew: false, isSale: true,
      name: '"ESSENTIAL" CREWNECK', price: 45000, originalPrice: 75000,
      image:      'assets/Products/Product 3/Producto3-1.webp',
      imageHover: 'assets/Products/Product 3/Producto3-2.webp',
    },
    {
      id: 'p04', drop: 'drop02', cat: 'tshirts', isNew: false, isSale: true,
      name: '"SQ WHITE" TEE', price: 29900, originalPrice: 46000,
      image:      'assets/Products/Producto 4/Producto4-1.webp',
      imageHover: 'assets/Products/Producto 4/Producto4-2.webp',
    },
    {
      id: 'p05', drop: 'drop02', cat: 'tshirts', isNew: true, isSale: true,
      name: '"GRAFFI-TEE"', price: 27600, originalPrice: 46000,
      image:      'assets/Products/Producto 5/Producto5-1.webp',
      imageHover: 'assets/Products/Producto 5/Producto5-2.webp',
    },
    {
      id: 'p06', drop: 'drop02', cat: 'crewnecks', isNew: false, isSale: true,
      name: '"BB" CREWNECK', price: 45000, originalPrice: 75000,
      image:      'assets/Products/Producto 6/Producto6-1.webp',
      imageHover: 'assets/Products/Producto 6/Producto6-2.webp',
    },
    {
      id: 'p07', drop: 'drop01', cat: 'hoodies', isNew: false, isSale: false,
      name: '"BASIC 01" HOODIE', price: 65000, originalPrice: 65000,
      image:      'assets/Products/Producto 7/Producto7-1.webp',
      imageHover: 'assets/Products/Producto 7/Producto7-2.webp',
    },
    {
      id: 'p08', drop: 'drop01', cat: 'tshirts', isNew: false, isSale: false,
      name: '"QUOTATION" TEE', price: 29900, originalPrice: 29900,
      image:      'assets/Products/Product 2/product2.webp',
      imageHover: 'assets/Products/Product 2/product2.webp',
    },
  ];

  // ── Computed ───────────────────────────────────────────────
  get visibleProducts(): CatalogProduct[] {
    let list = this.drop === 'all'
      ? this.allProducts
      : this.allProducts.filter(p => p.drop === this.drop);

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

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {}
  ngAfterViewInit(): void { this.initReveal(); }

  // ── setFilter: drops navegan, categorías filtran ──────────
  setFilter(value: string): void {
    const route = this.dropRoutes[value];
    if (route) {
      this.router.navigateByUrl(route);
      return;
    }
    this.activeFilter = value;
    setTimeout(() => this.initReveal(), 60);
  }

  setSort(value: string): void          { this.activeSort = value; this.sortOpen = false; }
  toggleSort(): void                     { this.sortOpen = !this.sortOpen; }
  setGridView(v: '2col' | '4col'): void { this.gridView = v; }

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
    this.cart.add({ product: p.name, price: p.price, size, image: p.image });
  }

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

