import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
    private cloudName = environment.cloudinary?.cloudName || '';
    private uploadPreset = environment.cloudinary?.uploadPreset || '';

    async uploadFile(file: File): Promise<string> {
        if (!this.cloudName || !this.uploadPreset) {
            throw new Error('Cloudinary is not configured. Set environment.cloudinary.cloudName and environment.cloudinary.uploadPreset.');
        }

        const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;
        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', this.uploadPreset);
        // small fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        let resp: Response;
        try {
            resp = await fetch(url, {
                method: 'POST',
                body: form,
                signal: controller.signal
            });
        } catch (err: any) {
            if (err.name === 'AbortError') {
                throw new Error('Cloudinary upload timed out (20s)');
            }
            throw new Error(`Cloudinary upload failed: ${err?.message || err}`);
        } finally {
            clearTimeout(timeout);
        }

        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(`Cloudinary upload failed: ${resp.status} ${txt}`);
        }

        const data = await resp.json();
        return data.secure_url as string;
    }
}
