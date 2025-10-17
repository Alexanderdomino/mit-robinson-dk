import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Admin } from './features/admin/admin';
import { AdminLogin } from './features/admin-login/admin-login';
import { adminGuard } from './core/services/admin.guard';
import { Radler } from './features/radler/radler';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'radler', component: Radler },
    { path: 'admin', component: Admin, canActivate: [adminGuard] },
    { path: 'admin/login', component: AdminLogin },
    { path: '**', redirectTo: '' }
];
