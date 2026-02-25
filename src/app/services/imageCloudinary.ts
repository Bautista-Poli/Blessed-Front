import { Injectable } from '@angular/core';

export interface UploadResult {
  url:      string;
  publicId: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly API = 'https://blessed-back-production.up.railway.app/api/uploads';

  async upload(
    file: File,
    folder: 'product' | 'drop' = 'product',
    onProgress?: (pct: number) => void
  ): Promise<UploadResult> {
    const fd = new FormData();
    fd.append('file', file);

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
          resolve({ url: data.url, publicId: data.publicId });
        } else {
          console.error('Upload error:', xhr.status, xhr.responseText);
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload error')));
      xhr.open('POST', `${this.API}/${folder}`);
      xhr.send(fd);
    });
  }

  async delete(publicId: string): Promise<void> {
    await fetch(this.API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
  }

  transform(url: string, opts: { w?: number; h?: number; crop?: string } = {}): string {
    if (!url.includes('cloudinary.com')) return url;
    const transforms = [
      opts.w    ? `w_${opts.w}`    : '',
      opts.h    ? `h_${opts.h}`    : '',
      opts.crop ? `c_${opts.crop}` : 'c_fill',
      'q_auto', 'f_auto',
    ].filter(Boolean).join(',');
    return url.replace('/upload/', `/upload/${transforms}/`);
  }
}