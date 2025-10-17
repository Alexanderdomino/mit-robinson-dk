import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Projects } from './features/projects/projects';
import { Admin } from './features/admin/admin';
import { AdminLogin } from './features/admin-login/admin-login';
import { adminGuard } from './core/services/admin.guard';
import { ProjectDetails } from './features/project-details/project-details';
import { Contact } from './features/contact/contact';
import { About } from './features/about/about';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'projects', component: Projects },
    { path: 'projects/:id', component: ProjectDetails },
    { path: 'contact', component: Contact },
    { path: 'about', component: About },
    { path: 'admin', component: Admin, canActivate: [adminGuard] },
    { path: 'admin/login', component: AdminLogin },
    { path: '**', redirectTo: '' }
];
