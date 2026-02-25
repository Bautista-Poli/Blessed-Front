import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SlotState = 'empty' | 'done' | 'error';

@Component({
  selector: 'app-image-upload-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'image-upload.html',
  styleUrl: 'image-upload.css',
})
export class ImageUploadSlotComponent {
  @Input() label = '1';
  @Input() required = false;

  // URL final (Cloudinary) si ya se subió (o vacío)
  @Input() value = '';

  // Emite el File al padre (wizard)
  @Output() fileChange = new EventEmitter<File | null>();

  state = signal<SlotState>('empty');
  previewSrc = signal<string | null>(null);
  isDragging = signal(false);

  ngOnInit() {
    this.applyValue();
  }

  ngOnChanges() {
    const v = (this.value ?? '').trim();
    if (v) {
      this.previewSrc.set(v);
      this.state.set('done');
    }
    // Si value está vacío, no tocar nada — el estado interno manda
  }

  private applyValue() {
    const v = (this.value ?? '').trim();
    if (v) {
      this.previewSrc.set(v);
      this.state.set('done');
    } else if (!this.previewSrc()) {  // ← esta condición
      this.state.set('empty');
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
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.state.set('error');
      return;
    }

    // Preview local inmediato (Instagram)
    const reader = new FileReader();
    reader.onload = (ev) => this.previewSrc.set(ev.target?.result as string);
    reader.readAsDataURL(file);

    this.state.set('done');
    this.fileChange.emit(file);
  }

  remove(e: Event) {
    e.stopPropagation();
    this.previewSrc.set(null);
    this.state.set('empty');
    this.fileChange.emit(null);
  }
  // Add this method to ImageUploadSlotComponent
  setPreview(src: string | null): void {
    this.previewSrc.set(src);
    this.state.set(src ? 'done' : 'empty');
  }
  
}