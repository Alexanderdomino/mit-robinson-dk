import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Inject } from '@angular/core';
import { ProjectsService } from '../../core/services/projects.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatListModule, DragDropModule, MatProgressSpinnerModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  projects: Project[] = [];

  // Inline editor state
  editingProject: Project | null = null; // null when not editing
  editMode: 'add' | 'edit' | null = null;
  workingProject: Project = { title: '', description: '', images: [] };
  saving = false;

  constructor(@Inject(ProjectsService) private repo: ProjectsService, private cloudinary: CloudinaryService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.repo.getAll().subscribe(list => this.projects = list);
  }

  startAdd(): void {
    this.editMode = 'add';
    this.editingProject = null;
    this.workingProject = { title: '', description: '', images: [] };
  }

  startEdit(project: Project): void {
    this.editMode = 'edit';
    this.editingProject = project;
    // clone project to avoid mutating list until saved
    this.workingProject = JSON.parse(JSON.stringify(project));
  }

  addImage(): void {
    // trigger central file picker to add a new image
    const el = document.getElementById('newImageInput') as HTMLInputElement | null;
    if (el) el.click();
  }

  onNewFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    if (!this.workingProject.images) this.workingProject.images = [];
    const nextOrder = this.workingProject.images.length ? Math.max(...this.workingProject.images.map(i => i.order)) + 1 : 0;
    const img: any = { url: '', order: nextOrder, file };
    const reader = new FileReader();
    reader.onload = () => {
      img.preview = reader.result as string;
      // force change detection so preview shows immediately
      try { this.cd.detectChanges(); } catch (e) { /* noop */ }
    };
    reader.readAsDataURL(file);
    this.workingProject.images.push(img);
    // If the component uses OnPush or the view hasn't updated, trigger detection
    try { this.cd.detectChanges(); } catch (e) { /* noop */ }
    // clear the input so same file can be selected again if needed
    input.value = '';
  }

  drop(event: CdkDragDrop<any[]>): void {
    if (!this.workingProject.images) return;
    moveItemInArray(this.workingProject.images, event.previousIndex, event.currentIndex);
    this.workingProject.images.forEach((im, idx) => im.order = idx);
    try { this.cd.detectChanges(); } catch (e) { /* noop */ }
  }

  onFileSelected(img: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    img.file = file;
    const reader = new FileReader();
    reader.onload = () => {
      img.preview = reader.result as string;
      try { this.cd.detectChanges(); } catch (e) { /* noop */ }
    };
    reader.readAsDataURL(file);
  }

  removeImage(img: { url: string; order: number }): void {
    if (!this.workingProject.images) return;
    const index = this.workingProject.images.indexOf(img as any);
    if (index === -1) return;
    this.workingProject.images.splice(index, 1);
    // re-normalize orders
    this.workingProject.images.forEach((im, idx) => im.order = idx);
    try { this.cd.detectChanges(); } catch (e) { /* noop */ }
  }

  moveImageUp(img: { url: string; order: number }): void {
    if (!this.workingProject.images) return;
    const imgs = this.workingProject.images;
    const index = imgs.indexOf(img as any);
    if (index <= 0) return;
    [imgs[index - 1], imgs[index]] = [imgs[index], imgs[index - 1]];
    imgs.forEach((im, idx) => im.order = idx);
  }

  moveImageDown(img: { url: string; order: number }): void {
    if (!this.workingProject.images) return;
    const imgs = this.workingProject.images;
    const index = imgs.indexOf(img as any);
    if (index === -1 || index >= imgs.length - 1) return;
    [imgs[index + 1], imgs[index]] = [imgs[index], imgs[index + 1]];
    imgs.forEach((im, idx) => im.order = idx);
  }

  async saveProject(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    // ensure images have order
    if (this.workingProject.images) {
      // upload any images that have a file attached and set url accordingly
      for (let i = 0; i < this.workingProject.images.length; i++) {
        const img = this.workingProject.images[i];
        if ((img as any).file instanceof File) {
          const file: File = (img as any).file as File;
          const uploadedUrl = await this.cloudinary.uploadFile(file);
          img.url = uploadedUrl;
          delete (img as any).file;
          delete (img as any).preview;
        }
        img.order = i;
      }
    }
    try {
      if (this.editMode === 'add') {
        await this.repo.add(this.workingProject);
      } else if (this.editMode === 'edit' && this.editingProject?.id) {
        await this.repo.update(this.editingProject.id, this.workingProject);
      }
      this.cancelEdit();
    } catch (err) {
      console.error('Failed to save project', err);
      alert('Der skete en fejl under gem. Se konsollen for detaljer.');
    } finally {
      this.saving = false;
    }
  }

  cancelEdit(): void {
    this.editMode = null;
    this.editingProject = null;
    this.workingProject = { title: '', description: '', images: [] };
  }

  async deleteProject(project: Project): Promise<void> {
    if (confirm(`Er du sikker på, at du vil slette "${project.title}"?`)) {
      await this.repo.delete(project.id as string);
    }
  }
}
