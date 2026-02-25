// src/app/interfaces/drop.ts
export interface DropConfig {
  id: string;
  number: string;
  label: string;
  tagline: string;
  description: string;
  hero_image: string;
  hero_image2?: string;
  accent_color: string;
  release_date: string;
  total_pieces: number;
  active: boolean;      // Aquí es donde faltaba la propiedad
  created_at: string;
}

export type CreateDropPayload = Omit<DropConfig, 'created_at'>;