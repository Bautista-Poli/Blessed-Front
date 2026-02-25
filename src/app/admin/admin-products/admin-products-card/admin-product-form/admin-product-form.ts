// src/app/admin/products/admin-product-form/admin-product-form.ts
import { Component, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../../services/product.service';
import { DropService } from '../../../../services/drop.service';
import { ImageUploadSlotComponent } from './image-upload-slot';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadSlotComponent],
  templateUrl: './admin-product-form.html',
  styleUrl:    './admin-product-form.css',
})
export class AdminProductFormComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private productService = inject(ProductService);
  private dropService    = inject(DropService);

  saved    = output<string>();
  canceled = output<void>();

  saving   = signal(false);
  errorMsg = signal<string | null>(null);

  // URLs de imágenes — se setean desde los slots
  imageUrls = signal<string[]>(['', '', '', '']);

  drops = toSignal(this.dropService.drops$, { initialValue: [] });

  readonly CATS = ['tshirts', 'hoodies', 'crewnecks'];

  form = this.fb.group({
    id:            ['', Validators.required],
    name:          ['', Validators.required],
    cat:           ['tshirts', Validators.required],
    drop:          ['', Validators.required],
    price:         [0, [Validators.required, Validators.min(1)]],
    originalPrice: [0, [Validators.required, Validators.min(1)]],
    isNew:         [true],
    isSale:        [false],
    description:   [''],
  });

  ngOnInit(): void {
    const firstDrop = this.drops()[0]?.id;
    if (firstDrop) this.form.patchValue({ drop: firstDrop });
  }

  // Callback de cada slot: index 0-3
  onImageUrl(index: number, url: string): void {
    const urls = [...this.imageUrls()];
    urls[index] = url;
    this.imageUrls.set(urls);
  }

  get hasMainImage(): boolean {
    return !!this.imageUrls()[0];
  }

  fieldErr(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  cancel(): void {
    this.resetForm();
    this.canceled.emit();
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.hasMainImage) {
      this.errorMsg.set('La foto principal es obligatoria.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set(null);

    try {
      const val    = this.form.value;
      const images = this.imageUrls().filter(Boolean);

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

      this.saved.emit(val.name!);
      this.resetForm();
    } catch {
      this.errorMsg.set('Error al guardar el producto.');
    } finally {
      this.saving.set(false);
    }
  }

  private resetForm(): void {
    const firstDrop = this.drops()[0]?.id ?? '';
    this.form.reset({
      cat: 'tshirts', drop: firstDrop,
      isNew: true, isSale: false,
      price: 0, originalPrice: 0,
    });
    this.imageUrls.set(['', '', '', '']);
    this.errorMsg.set(null);
  }
}
