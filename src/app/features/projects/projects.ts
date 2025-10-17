import { Component, OnInit, Inject } from '@angular/core';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, MatCardModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects {
  projects: Project[] = [];

  constructor(@Inject(ProjectsService) private repo: ProjectsService, private router: Router) { }

  ngOnInit(): void {
    this.repo.getAll().subscribe(list => this.projects = list.sort((a, b) => {
      const aOrder = (a.images && a.images.length) ? Math.min(...a.images.map(i => i.order)) : 0;
      const bOrder = (b.images && b.images.length) ? Math.min(...b.images.map(i => i.order)) : 0;
      return aOrder - bOrder;
    }));
  }

  openProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }
}
