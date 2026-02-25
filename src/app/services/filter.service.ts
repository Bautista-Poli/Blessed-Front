// src/app/services/filter.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from './product.service';
import { DropConfig } from '../interfaces/drop';

export interface FilterOption  { label: string; value: string; }
export interface SortOption    { label: string; value: string; }
export type GridView           = '2col' | '4col';
export type SortValue          = 'new' | 'price-asc' | 'price-desc' | 'discount';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private router         = inject(Router);
  private productService = inject(ProductService);

  // ── Estado de UI ───────────────────────────────────────────
  activeFilter = signal<string>('all');
  activeSort   = signal<SortValue>('new');
  gridView     = signal<GridView>('4col');
  sortOpen     = signal(false);

  // ── Datos ──────────────────────────────────────────────────
  drops         = signal<DropConfig[]>([]);
  loadingDrops  = signal(true);

  // ── Opciones de ordenamiento (estáticas) ──────────────────
  readonly sortOptions: SortOption[] = [
    { label: 'Novedades',     value: 'new'        },
    { label: 'Precio: menor', value: 'price-asc'  },
    { label: 'Precio: mayor', value: 'price-desc' },
    { label: '% Descuento',   value: 'discount'   },
  ];

  // ── Filtros dinámicos (recalculados cuando cambian los drops) ──
  readonly filters = computed<FilterOption[]>(() => {
    const base: FilterOption[] = [
      { label: 'Ver todo',  value: 'all'      },
      { label: 'T-Shirts',  value: 'tshirts'  },
      { label: 'Hoodies',   value: 'hoodies'  },
      { label: 'Sale',      value: 'sale'      },
    ];
    const dynamicDrops = this.drops().map(d => ({
      label: `Drop ${d.number}`,
      value: d.id,
    }));
    return [...base, ...dynamicDrops];
  });

  // ── Rutas de navegación dinámicas ─────────────────────────
  readonly dropRoutes = computed<Record<string, string>>(() => {
    const routes: Record<string, string> = { all: '/catalog' };
    this.drops().forEach(d => { routes[d.id] = `/drops/${d.id}`; });
    return routes;
  });

  // ── Carga drops del backend ────────────────────────────────
  loadDrops(): void {
    if (this.drops().length) return; // ya cargado, evita refetch
    this.loadingDrops.set(true);
    this.productService.getDrops().subscribe({
      next:  data  => { this.drops.set(data); this.loadingDrops.set(false); },
      error: ()    => this.loadingDrops.set(false),
    });
  }

  // ── Handlers ──────────────────────────────────────────────
  setFilter(value: string): void {
    const route = this.dropRoutes()[value];
    if (route) {
      this.router.navigateByUrl(route);
      return;
    }
    this.activeFilter.set(value);
  }

  setSort(value: string): void {
    this.activeSort.set(value as SortValue);
    this.sortOpen.set(false);
  }

  toggleSort(): void {
    this.sortOpen.update(v => !v);
  }

  setGridView(v: GridView): void {
    this.gridView.set(v);
  }

  // ── Reset (útil al cambiar de página) ─────────────────────
  resetFilter(): void {
    this.activeFilter.set('all');
    this.activeSort.set('new');
    this.sortOpen.set(false);
  }
}