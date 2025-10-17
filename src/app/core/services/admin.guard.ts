import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);
    return new Promise<boolean>(resolve => {
        const unsub = auth.onAuthStateChanged(user => {
            if (user && user.email === environment.adminEmail) {
                resolve(true);
            } else {
                // redirect to login page
                router.navigate(['/admin/login']);
                resolve(false);
            }
            unsub();
        });
    });
};
