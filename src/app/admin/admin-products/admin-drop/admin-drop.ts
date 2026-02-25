// src/app/admin/drops/admin-drops.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DropConfig } from '../../../interfaces/drop';
import { DropService } from '../../../services/drop.service';

@Component({
  selector: 'app-admin-drops',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-drop.html',
  styleUrl: './admin-drop.css',
})
export class AdminDropsComponent implements OnInit {
  private dropService = inject(DropService);
  private fb          = inject(FormBuilder);

  drops      = toSignal(this.dropService.drops$, { initialValue: [] });
  saving     = signal(false);
  deleting   = signal<string | null>(null);
  toggling   = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);
  showForm   = signal(false);
  previewUrl = signal<string | null>(null);
  editingId  = signal<string | null>(null);

  activeDrops   = computed(() => this.drops().filter(d => d.active));
  inactiveDrops = computed(() => this.drops().filter(d => !d.active));

  form = this.fb.group({
    id:           ['', Validators.required],
    number:       ['', Validators.required],
    label:        ['', Validators.required],
    tagline:      ['', Validators.required],
    description:  ['', Validators.required],
    hero_image:   ['', Validators.required],
    hero_image2:  [''],
    accent_color: ['#e8e4dc', Validators.required],
    release_date: ['', Validators.required],
    total_pieces: [0, [Validators.required, Validators.min(0)]],
    active:       [true],
  });

  ngOnInit(): void {
    this.dropService.getDrops().subscribe();
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.form.reset({
      accent_color: '#e8e4dc',
      total_pieces: 0,
      active: true,
    });
    this.previewUrl.set(null);
    this.editingId.set(null);
  }

  editDrop(drop: DropConfig): void {
    this.editingId.set(drop.id);
    this.form.patchValue({
      id:           drop.id,
      number:       drop.number,
      label:        drop.label,
      tagline:      drop.tagline,
      description:  drop.description,
      hero_image:   drop.hero_image,
      hero_image2:  drop.hero_image2 || '',
      accent_color: drop.accent_color,
      release_date: drop.release_date,
      total_pieces: drop.total_pieces,
      active:       drop.active,
    });
    // Deshabilitar ID en edición
    this.form.get('id')!.disable();
    this.previewUrl.set(drop.hero_image || null);
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const val = this.form.getRawValue(); // getRawValue incluye campos disabled

      if (this.editingId()) {
        await this.dropService.updateDrop(this.editingId()!, {
          number:       val.number!,
          label:        val.label!,
          tagline:      val.tagline!,
          description:  val.description!,
          hero_image:   val.hero_image!,
          hero_image2:  val.hero_image2 || undefined,
          accent_color: val.accent_color!,
          release_date: val.release_date!,
          total_pieces: Number(val.total_pieces),
          active:       !!val.active,
        });
        this.successMsg.set(`"${val.label}" actualizado correctamente.`);
      } else {
        await this.dropService.createDrop({
          id:           val.id!,
          number:       val.number!,
          label:        val.label!,
          tagline:      val.tagline!,
          description:  val.description!,
          hero_image:   val.hero_image!,
          hero_image2:  val.hero_image2 || undefined,
          accent_color: val.accent_color!,
          release_date: val.release_date!,
          total_pieces: Number(val.total_pieces),
          active:       !!val.active,
        });
        this.successMsg.set(`"${val.label}" creado correctamente.`);
      }

      setTimeout(() => this.successMsg.set(null), 3000);
      this.toggleForm();
    } catch {
      this.errorMsg.set('Error al guardar el drop.');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(drop: DropConfig): Promise<void> {
    this.toggling.set(drop.id);
    try {
      await this.dropService.toggleActive(drop.id, !drop.active);
      this.successMsg.set(`"${drop.label}" ${!drop.active ? 'activado' : 'desactivado'}.`);
      setTimeout(() => this.successMsg.set(null), 3000);
    } catch {
      this.errorMsg.set('Error al cambiar estado del drop.');
    } finally {
      this.toggling.set(null);
    }
  }

  async deleteDrop(drop: DropConfig): Promise<void> {
    if (!confirm(`¿Eliminar el drop "${drop.label}"? Esta acción no se puede deshacer.`)) return;
    this.deleting.set(drop.id);
    try {
      await this.dropService.deleteDrop(drop.id);
      this.successMsg.set(`"${drop.label}" eliminado.`);
      setTimeout(() => this.successMsg.set(null), 3000);
    } catch {
      this.errorMsg.set('Error al eliminar el drop.');
    } finally {
      this.deleting.set(null);
    }
  }

  fieldErr(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}