// src/app/admin/drops/admin-drop-form.ts
import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DropConfig } from '../../../../interfaces/drop';

@Component({
  selector: 'app-admin-drop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-drop-form.html',
  styleUrl: './admin-drop-form.css',
})
export class AdminDropFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() editingDrop: DropConfig | null = null;
  @Input() saving = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  previewUrl = signal<string | null>(null);

  form = this.fb.group({
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

  ngOnInit() {
    if (this.editingDrop) {
      this.form.patchValue(this.editingDrop);
      this.previewUrl.set(this.editingDrop.hero_image);
    }
  }

  onImageInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.previewUrl.set(val || null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValues = this.form.getRawValue();
    
    const generatedId = `drop${rawValues.number}`;

    const payload = {
      ...rawValues,
      id: this.editingDrop ? this.editingDrop.id : generatedId
    };

    this.save.emit(payload);
  }

  fieldErr(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}