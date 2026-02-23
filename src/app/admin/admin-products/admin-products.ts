// src/app/admin/products/admin-products.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../product.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProductsComponent implements OnInit {
  private auth           = inject(AuthService);
  private router         = inject(Router);
  private productService = inject(ProductService);
  private fb             = inject(FormBuilder);

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
    image:         ['', Validators.required],
    imageHover:    [''],
    description:   [''],
  });

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
    }
    this.productService.getProducts().subscribe();
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
      await this.productService.createProduct({
        id:            val.id!,
        name:          val.name!,
        cat:           val.cat!,
        drop:          val.drop! as any,
        price:         Number(val.price),
        originalPrice: Number(val.originalPrice),
        isNew:         !!val.isNew,
        isSale:        !!val.isSale,
        image:         val.image!,
        imageHover:    val.imageHover || undefined,
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

  formatPrice(n: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
  }

  discount(p: any): number {
    if (!p.isSale || p.originalPrice === p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  fieldErr(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}