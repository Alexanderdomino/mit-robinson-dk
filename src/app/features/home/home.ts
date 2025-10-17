import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../core/models/project.model';
import { Inject } from '@angular/core';
import { ProjectsService } from '../../core/services/projects.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  projects: Project[] = [];

  offers = [
    { icon: 'memory', text: 'PLC- og HMI-programmering' },
    { icon: 'electrical_services', text: 'El-tavle design og konstruktion' },
    { icon: 'precision_manufacturing', text: 'Automationsprojekter fra idé til drift' }
  ];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    autoplay: true,
    autoplayTimeout: 8000,
    dots: true,
    nav: false,
    items: 1
  };

  constructor(@Inject(ProjectsService) private repo: ProjectsService, private router: Router) { }

  ngOnInit(): void {
    this.repo.getAll().subscribe(list => this.projects = list);
  }

  trackById(index: number, item: Project) {
    return item.id || index;
  }

  openProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }
}
