import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DropConfig } from '../../../interfaces/drop';
import { DropService } from '../../../services/drop.service';
import { AdminDropFormComponent } from './admin-drop-form/admin-drop-form';

@Component({
  selector: 'app-admin-drops',
  standalone: true,
  imports: [CommonModule, AdminDropFormComponent],
  templateUrl: './admin-drop.html',
  styleUrl: './admin-drop.css',
})
export class AdminDropsComponent implements OnInit {
  private dropService = inject(DropService);

  // Datos y Estados
  drops      = toSignal(this.dropService.drops$, { initialValue: [] });
  activeDrops = computed(() => this.drops().filter(d => d.active));
  
  // Señales de Control
  showForm     = signal(false);
  editingId    = signal<string | null>(null);
  selectedDrop = signal<DropConfig | null>(null);
  
  // Estados de carga y mensajes
  saving     = signal(false);
  deleting   = signal<string | null>(null);
  toggling   = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);

  ngOnInit(): void {
    this.dropService.getDrops().subscribe();
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.selectedDrop.set(null);
      this.editingId.set(null);
    }
  }

  editDrop(drop: DropConfig): void {
    this.selectedDrop.set(drop);
    this.editingId.set(drop.id);
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async handleSave(formData: any): Promise<void> {
    this.saving.set(true);
    this.errorMsg.set(null);

    try {
      if (this.editingId()) {
        await this.dropService.updateDrop(this.editingId()!, formData);
        this.successMsg.set(`"${formData.label}" actualizado correctamente.`);
      } else {
        await this.dropService.createDrop(formData);
        this.successMsg.set(`"${formData.label}" creado correctamente.`);
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
      this.errorMsg.set('Error al cambiar estado.');
    } finally {
      this.toggling.set(null);
    }
  }

  async deleteDrop(drop: DropConfig): Promise<void> {
    if (!confirm(`¿Eliminar "${drop.label}"?`)) return;
    this.deleting.set(drop.id);
    try {
      await this.dropService.deleteDrop(drop.id);
      this.successMsg.set(`"${drop.label}" eliminado.`);
      setTimeout(() => this.successMsg.set(null), 3000);
    } catch {
      this.errorMsg.set('Error al eliminar.');
    } finally {
      this.deleting.set(null);
    }
  }
}