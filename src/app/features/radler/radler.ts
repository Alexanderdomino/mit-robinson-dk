// ...existing code...
import { Component, OnInit, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RadlersService } from '../../core/services/radlers.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { RadlerItem, RadlerReview } from '../../core/models/radler.model';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-radler',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './radler.html',
  styleUrl: './radler.scss'
})
export class Radler implements OnInit, OnDestroy {
  removeImage(): void {
    this.imageFile = undefined;
    this.imagePreview = undefined;
    this.working.imageUrl = undefined;
    try { this.cd.detectChanges(); } catch { }
  }
  radlers: RadlerItem[] = [];

  adding = false;
  saving = false;
  working: RadlerItem = { title: '', beer: '', mixer: '', createdAt: Date.now() };
  imageFile?: File;
  imagePreview?: string;
  draggingOver = false;

  // Review UI state (per-list item minimal)
  reviewInputs: Record<string, { rating: number; comment: string }> = {};
  avgRatings: Record<string, number> = {};
  reviewsSubs: Record<string, Subscription> = {};

  user: any = null;

  constructor(
    @Inject(RadlersService) private repo: RadlersService,
    private cloudinary: CloudinaryService,
    private cd: ChangeDetectorRef,
    private auth: AuthService
  ) {
    this.auth.user$.subscribe(u => {
      this.user = u;
      try { this.cd.detectChanges(); } catch { }
    });
  }

  ngOnInit(): void {
    this.repo.getAll().subscribe(list => {
      // sort by createdAt desc
      this.radlers = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      this.updateReviewStreams();
    });
  }

  ngOnDestroy(): void {
    Object.values(this.reviewsSubs).forEach(s => s.unsubscribe());
    this.reviewsSubs = {};
  }

  startAdd(): void {
    this.adding = true;
    this.saving = false;
    this.working = { title: '', beer: '', mixer: '', createdAt: Date.now() };
    this.imageFile = undefined;
    this.imagePreview = undefined;
  }

  cancelAdd(): void {
    this.adding = false;
    this.saving = false;
    this.working = { title: '', beer: '', mixer: '', createdAt: Date.now() };
    this.imageFile = undefined;
    this.imagePreview = undefined;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      try { this.cd.detectChanges(); } catch { }
    };
    reader.readAsDataURL(file);
    // clear to allow reselection of same file
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.draggingOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.draggingOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.draggingOver = false;
    const files = event.dataTransfer?.files;
    if (!files || !files.length) return;
    const file = files[0];
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      try { this.cd.detectChanges(); } catch { }
    };
    reader.readAsDataURL(file);
  }

  async saveRadler(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      let imageUrl = this.working.imageUrl;
      if (this.imageFile) {
        imageUrl = await this.cloudinary.uploadFile(this.imageFile);
      }
      const payload: RadlerItem = {
        ...this.working,
        imageUrl,
        createdAt: this.working.createdAt || Date.now()
      };
      await this.repo.add(payload);
      this.cancelAdd();
    } catch (err) {
      console.error('Failed to save radler', err);
      alert('Kunne ikke gemme radler. Se konsollen for detaljer.');
    } finally {
      this.saving = false;
    }
  }

  // Reviews
  avgRatingFor(radlerId: string): number | null {
    return this.avgRatings[radlerId] ?? null;
  }

  ensureReviewInput(radlerId: string): { rating: number; comment: string } {
    if (!this.reviewInputs[radlerId]) this.reviewInputs[radlerId] = { rating: 0, comment: '' };
    return this.reviewInputs[radlerId];
  }

  async submitReview(radler: RadlerItem): Promise<void> {
    if (!this.user) {
      alert('Du skal være logget ind for at anmelde.');
      return;
    }
    const input = this.ensureReviewInput(radler.id as string);
    const rating = Math.max(0, Math.min(5, Number(input.rating || 0)));
    const review: RadlerReview = {
      rating,
      comment: input.comment || undefined,
      createdAt: Date.now(),
      user: this.user.displayName || this.user.email || 'Ukendt'
    };
    try {
      await this.repo.addReview(radler.id as string, review);
      this.reviewInputs[radler.id as string] = { rating: 0, comment: '' };
    } catch (e) {
      console.error('Failed to submit review', e);
      alert('Kunne ikke gemme anmeldelse.');
    }
  }

  setReviewRating(radlerId: string, rating: number): void {
    this.ensureReviewInput(radlerId).rating = rating;
    try { this.cd.detectChanges(); } catch { }
  }

  private updateReviewStreams(): void {
    const existingIds = new Set(Object.keys(this.reviewsSubs));
    const currentIds = new Set(this.radlers.map(r => r.id!).filter(Boolean));

    // unsubscribe removed
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        this.reviewsSubs[id].unsubscribe();
        delete this.reviewsSubs[id];
        delete this.avgRatings[id];
      }
    }

    // subscribe new
    for (const r of this.radlers) {
      const id = r.id;
      if (!id || this.reviewsSubs[id]) continue;
      this.reviewsSubs[id] = this.repo.getReviews(id).subscribe(reviews => {
        if (!reviews || reviews.length === 0) {
          this.avgRatings[id] = 0;
        } else {
          const sum = reviews.reduce((acc, rv) => acc + (Number(rv.rating) || 0), 0);
          this.avgRatings[id] = Math.round((sum / reviews.length) * 10) / 10; // one decimal place
        }
        try { this.cd.detectChanges(); } catch { }
      });
    }
  }

  starsString(avg: number | null | undefined): string {
    if (avg == null) return '';
    const filled = Math.round(avg);
    return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
  }
}
