// src/app/admin/products/admin-products.ts  (VERSIÓN ACTUALIZADA)
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth.service';
import { AdminProductCardComponent } from './admin-products-card/admin-products-card';
import { ProductService } from '../../services/product.service';
import { DropService } from '../../services/drop.service';
import { AdminDropsComponent } from './admin-drop/admin-drop';

type AdminTab = 'productos' | 'drops';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminProductCardComponent, AdminDropsComponent],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProductsComponent implements OnInit {
  private auth           = inject(AuthService);
  private router         = inject(Router);
  private productService = inject(ProductService);
  private dropService    = inject(DropService);                       // ← nuevo
  private fb             = inject(FormBuilder);

  // ── Tabs ──────────────────────────────────────────────────────
  activeTab = signal<AdminTab>('productos');

  // ── Productos ─────────────────────────────────────────────────
  products     = toSignal(this.productService.products$, { initialValue: [] });
  saving       = signal(false);
  deleting     = signal<string | null>(null);
  successMsg   = signal<string | null>(null);
  errorMsg     = signal<string | null>(null);
  showForm     = signal(false);
  searchQuery  = signal('');
  previewUrl   = signal<string | null>(null);

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.products().filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
    );
  });

  // ── Drops (badge en sidebar) ───────────────────────────────────
  drops           = toSignal(this.dropService.drops$, { initialValue: [] });
  activeDropsCount = computed(() => this.drops().filter(d => d.active).length);

  readonly CATS   = ['tshirts', 'hoodies', 'crewnecks'];
  readonly DROPS  = ['drop01', 'drop02'];
  readonly SIZES  = ['XS', 'S', 'M', 'L', 'XL'];

  form = this.fb.group({
    id:            ['', Validators.required],
    name:          ['', Validators.required],
    cat:           ['tshirts', Validators.required],
    drop:          ['drop02', Validators.required],
    price:         [0, [Validators.required, Validators.min(1)]],
    originalPrice: [0, [Validators.required, Validators.min(1)]],
    isNew:         [true],
    isSale:        [false],
    image1:        ['', Validators.required],
    image2:        [''],
    image3:        [''],
    image4:        [''],
    description:   [''],
  });

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
    }
    this.productService.getProducts().subscribe();
    this.dropService.getDrops().subscribe();                         // ← nuevo
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.form.reset({ cat: 'tshirts', drop: 'drop02', isNew: true, isSale: false, price: 0, originalPrice: 0 });
      this.previewUrl.set(null);
    }
  }

  onImageInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.previewUrl.set(val || null);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set(null);

    try {
      const val = this.form.value;
      const images = [val.image1, val.image2, val.image3, val.image4]
        .filter(url => !!url) as string[];

      await this.productService.createProduct({
        id:            val.id!,
        name:          val.name!,
        cat:           val.cat!,
        drop:          val.drop!,
        price:         Number(val.price),
        originalPrice: Number(val.originalPrice),
        isNew:         !!val.isNew,
        isSale:        !!val.isSale,
        images,
        description:   val.description || undefined,
        colors:        [],
        stock:         [],
      });
      this.successMsg.set(`"${val.name}" agregado correctamente.`);
      setTimeout(() => this.successMsg.set(null), 3000);
      this.toggleForm();
    } catch {
      this.errorMsg.set('Error al guardar el producto.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteProduct(id: string, name: string): Promise<void> {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    this.deleting.set(id);
    try {
      await this.productService.deleteProduct(id);
      this.successMsg.set(`"${name}" eliminado.`);
      setTimeout(() => this.successMsg.set(null), 3000);
    } catch {
      this.errorMsg.set('Error al eliminar el producto.');
    } finally {
      this.deleting.set(null);
    }
  }

  fieldErr(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}