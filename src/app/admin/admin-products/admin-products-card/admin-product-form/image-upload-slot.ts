// src/app/admin/components/image-upload-slot/image-upload-slot.ts
import {
  Component, Input, Output, EventEmitter,
  signal, HostListener, ElementRef, ViewChild, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from '../../../../services/imageCloudinary';

export type SlotState = 'empty' | 'uploading' | 'done' | 'error';

@Component({
  selector: 'app-image-upload-slot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="slot"
      [class.slot--drag]="isDragging()"
      [class.slot--done]="state() === 'done'"
      [class.slot--uploading]="state() === 'uploading'"
      [class.slot--error]="state() === 'error'"
      [class.slot--required]="required"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
    >
      <input
        #fileInput
        type="file"
        accept="image/*"
        class="slot__input"
        (change)="onFileChange($event)"
      />

      <!-- Estado: vacío -->
      @if (state() === 'empty') {
        <div class="slot__empty">
          <div class="slot__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <span class="slot__label">
            @if (required) { <strong>Foto {{ label }}</strong> } @else { Foto {{ label }} }
          </span>
          <span class="slot__hint">Arrastrá o tocá</span>
        </div>
      }

      <!-- Estado: subiendo -->
      @if (state() === 'uploading') {
        <div class="slot__uploading">
          <div class="slot__progress-ring">
            <svg viewBox="0 0 44 44" width="44" height="44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#e5e7eb" stroke-width="3"/>
              <circle
                cx="22" cy="22" r="18"
                fill="none" stroke="#111" stroke-width="3"
                stroke-dasharray="113"
                [style.stroke-dashoffset]="progressOffset()"
                stroke-linecap="round"
                transform="rotate(-90 22 22)"
                style="transition: stroke-dashoffset .15s"
              />
            </svg>
            <span class="slot__pct">{{ progress() }}%</span>
          </div>
        </div>
      }

      <!-- Estado: imagen cargada -->
      @if (state() === 'done' && previewSrc()) {
        <div class="slot__preview">
          <img [src]="previewSrc()!" [alt]="label" />
          <div class="slot__overlay">
            <button class="slot__remove" (click)="remove($event)" type="button" aria-label="Eliminar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <span class="slot__change">Cambiar</span>
          </div>
        </div>
      }

      <!-- Estado: error -->
      @if (state() === 'error') {
        <div class="slot__error-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" width="24" height="24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Error<br><small>Tocá para reintentar</small></span>
        </div>
      }

    </div>
  `,
  styles: [`
    .slot {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12px;
      border: 2px dashed #d1d5db;
      background: #f9fafb;
      cursor: pointer;
      overflow: hidden;
      transition: border-color .2s, background .2s, transform .15s;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .slot:hover { border-color: #9ca3af; background: #f3f4f6; }
    .slot--drag  { border-color: #111; background: #f0f0f0; transform: scale(1.02); }
    .slot--done  { border-style: solid; border-color: #d1d5db; }
    .slot--error { border-color: #ef4444; background: #fef2f2; }
    .slot--required.slot:not(.slot--done) { border-color: #111; }

    .slot__input {
      display: none;
    }

    /* ── Empty ── */
    .slot__empty {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: .4rem; padding: .75rem;
      text-align: center;
    }

    .slot__icon { color: #9ca3af; }
    .slot--required:not(.slot--done) .slot__icon { color: #374151; }

    .slot__label {
      font-size: .72rem;
      color: #374151;
      letter-spacing: .02em;
    }

    .slot__hint {
      font-size: .65rem;
      color: #9ca3af;
    }

    /* ── Uploading ── */
    .slot__uploading {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
    }

    .slot__progress-ring {
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }

    .slot__pct {
      position: absolute;
      font-size: .7rem;
      font-weight: 700;
      color: #111;
    }

    /* ── Preview ── */
    .slot__preview {
      position: absolute; inset: 0;
    }

    .slot__preview img {
      width: 100%; height: 100%;
      object-fit: cover; display: block;
    }

    .slot__overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: .4rem;
      transition: background .2s;
      opacity: 0;
    }

    .slot:hover .slot__overlay,
    .slot:active .slot__overlay {
      background: rgba(0,0,0,.45);
      opacity: 1;
    }

    .slot__remove {
      background: rgba(255,255,255,.9);
      border: none; border-radius: 50%;
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #111;
      transition: background .15s;
    }

    .slot__remove:hover { background: #fff; }

    .slot__change {
      font-size: .65rem;
      color: #fff;
      letter-spacing: .08em;
      text-transform: uppercase;
      font-weight: 600;
    }

    /* ── Error ── */
    .slot__error-content {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: .4rem; text-align: center;
      font-size: .7rem; color: #ef4444;
    }
  `]
})
export class ImageUploadSlotComponent {
  @Input() label    = '1';
  @Input() required = false;
  @Input() value    = '';                  // URL inicial (si ya tiene imagen)

  @Output() urlChange = new EventEmitter<string>();  // emite URL final o ''

  private cloudinary = inject(CloudinaryService);

  state      = signal<SlotState>('empty');
  progress   = signal(0);
  previewSrc = signal<string | null>(null);
  isDragging = signal(false);

  progressOffset() {
    // circunferencia = 2π×18 ≈ 113
    return 113 - (113 * this.progress()) / 100;
  }

  ngOnInit() {
    if (this.value) {
      this.previewSrc.set(this.value);
      this.state.set('done');
    }
  }

  // ── Drag & Drop ──────────────────────────────────────────────
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  // ── File input ───────────────────────────────────────────────
  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  // ── Upload ───────────────────────────────────────────────────
  private async handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;

    // Preview local inmediato (como Instagram)
    const reader = new FileReader();
    reader.onload = (e) => this.previewSrc.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.state.set('uploading');
    this.progress.set(0);

    try {
      const result = await this.cloudinary.upload(file, (pct) => {
        this.progress.set(pct);
      });
      this.state.set('done');
      this.previewSrc.set(result.url);
      this.urlChange.emit(result.url);
    } catch {
      this.state.set('error');
      this.previewSrc.set(null);
      this.urlChange.emit('');
    }
  }

  // ── Remove ───────────────────────────────────────────────────
  remove(e: Event) {
    e.stopPropagation();
    this.state.set('empty');
    this.previewSrc.set(null);
    this.progress.set(0);
    this.urlChange.emit('');
  }
}