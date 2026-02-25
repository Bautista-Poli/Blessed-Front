import { Component, inject, signal, output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../../services/product.service';
import { DropService } from '../../../../services/drop.service';
import { ImageUploadSlotComponent } from './image-upload/image-upload-slot';
import { CloudinaryService } from '../../../../services/imageCloudinary';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadSlotComponent],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css',
})
export class AdminProductFormComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private productService = inject(ProductService);
  private dropService    = inject(DropService);
  private cloudinary     = inject(CloudinaryService);

  @ViewChild(ImageUploadSlotComponent) slot?: ImageUploadSlotComponent;

  saved    = output<string>();
  canceled = output<void>();

  saving   = signal(false);
  errorMsg = signal<string | null>(null);

  // Wizard
  index = signal(0);
  readonly requiredCount = 1; // solo la principal obligatoria
  readonly maxPhotos = 4;

  // Estado por foto
  files    = signal<(File | null)[]>([null, null, null, null]);
  previews = signal<(string | null)[]>([null, null, null, null]);
  imageUrls = signal<(string | null)[]>([null, null, null, null]);

  uploading = signal(false);
  progress  = signal(0);

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

  get hasMainImage(): boolean {
    return !!this.imageUrls()[0];
  }

  fieldErr(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // === Wizard handlers ===

  onFileSelected(file: File | null) {
    const i = this.index();

    const nextFiles = [...this.files()];
    const nextPreviews = [...this.previews()];
    const nextUrls = [...this.imageUrls()];

    if (file) {
      nextFiles[i] = file;
      nextUrls[i] = null;
      this.files.set(nextFiles);
      this.imageUrls.set(nextUrls);

      // Guardá el preview en el array CUANDO el FileReader termine
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const p = [...this.previews()];
        p[i] = src;
        this.previews.set(p);
        // NO llamar slot?.setPreview() acá — el slot ya se lo puso solo
      };
      reader.readAsDataURL(file);
    } else {
      nextFiles[i] = null;
      nextPreviews[i] = null;
      nextUrls[i] = null;
      this.files.set(nextFiles);
      this.previews.set(nextPreviews);
      this.imageUrls.set(nextUrls);
      this.slot?.setPreview(null); // solo al remover está bien
    }
  }

  async next() {
    if (this.uploading()) return;

    const i = this.index();
    const file = this.files()[i];

    if (i < this.requiredCount && !file && !this.imageUrls()[i]) {
      this.errorMsg.set('La foto principal es obligatoria.');
      return;
    }

    if (this.imageUrls()[i]) {
      this.goTo(Math.min(i + 1, this.maxPhotos - 1));
      return;
    }

    if (!file) {
      this.goTo(Math.min(i + 1, this.maxPhotos - 1));
      return;
    }

    this.errorMsg.set(null);
    this.uploading.set(true);
    this.progress.set(0);

    try {
      // 🔧 MOCK: simular upload con delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      for (let p = 0; p <= 100; p += 20) {
        this.progress.set(p);
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      const mockUrl = `https://res.cloudinary.com/mock/image/upload/foto_${i + 1}.jpg`;
      const nextUrls = [...this.imageUrls()];
      nextUrls[i] = mockUrl;
      this.imageUrls.set(nextUrls);

      this.goTo(Math.min(i + 1, this.maxPhotos - 1));
    } catch {
      this.errorMsg.set('Error al subir la imagen.');
    } finally {
      this.uploading.set(false);
      this.progress.set(0);
    }
  }

  back() {
    if (this.uploading()) return;
    const i = this.index();
    this.goTo(Math.max(i - 1, 0));
  }

  private goTo(i: number) {
    this.index.set(i);
    const src = this.previews()[i] ?? this.imageUrls()[i] ?? null;
    this.slot?.setPreview(src);
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
      const val = this.form.value;
      const images = (this.imageUrls() as (string | null)[]).filter(Boolean) as string[];

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

    this.index.set(0);
    this.files.set([null, null, null, null]);
    this.previews.set([null, null, null, null]);
    this.imageUrls.set([null, null, null, null]);

    this.errorMsg.set(null);

    // reset preview del slot visible
    this.slot?.setPreview(null);
  }


  
}
