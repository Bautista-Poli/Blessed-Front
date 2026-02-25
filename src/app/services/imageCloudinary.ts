// src/app/services/cloudinary.service.ts
import { Injectable } from '@angular/core';

export interface UploadResult {
  url:       string;
  publicId:  string;
  width:     number;
  height:    number;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  // ─── Configurá estas constantes con tu cuenta de Cloudinary ───
  // 1. Creá una cuenta en https://cloudinary.com (free)
  // 2. En Settings > Upload > Upload presets → creá uno "Unsigned"
  // 3. Copiá tu Cloud Name desde el Dashboard
  private readonly CLOUD_NAME   = 'TU_CLOUD_NAME';      // ← reemplazá
  private readonly UPLOAD_PRESET = 'TU_UPLOAD_PRESET';  // ← reemplazá
  private readonly FOLDER        = 'blessed/products';   // carpeta en Cloudinary

  private readonly API_URL = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;

  async upload(file: File, onProgress?: (pct: number) => void): Promise<UploadResult> {
    const fd = new FormData();
    fd.append('file',          file);
    fd.append('upload_preset', this.UPLOAD_PRESET);
    fd.append('folder',        this.FOLDER);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url:      data.secure_url,
            publicId: data.public_id,
            width:    data.width,
            height:   data.height,
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload error')));
      xhr.open('POST', this.API_URL);
      xhr.send(fd);
    });
  }

  // Genera URL con transformaciones de Cloudinary (útil para thumbnails)
  transform(url: string, opts: { w?: number; h?: number; crop?: string } = {}): string {
    if (!url.includes('cloudinary.com')) return url;
    const transforms = [
      opts.w    ? `w_${opts.w}`   : '',
      opts.h    ? `h_${opts.h}`   : '',
      opts.crop ? `c_${opts.crop}` : 'c_fill',
      'q_auto', 'f_auto',
    ].filter(Boolean).join(',');

    return url.replace('/upload/', `/upload/${transforms}/`);
  }
}