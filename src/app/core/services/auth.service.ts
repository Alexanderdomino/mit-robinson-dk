import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private auth: Auth) { }

    get user$(): Observable<any> {
        return new Observable(sub => {
            return this.auth.onAuthStateChanged(user => sub.next(user), err => sub.error(err));
        });
    }

    // Sign in with Google. On mobile (Safari) use redirect flow which is more reliable.
    async signInWithGoogle(): Promise<void> {
        const provider = new GoogleAuthProvider();
        // force account chooser so user can switch accounts if already signed in
        provider.setCustomParameters({ prompt: 'select_account' });

        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const isMobile = /iPhone|iPad|iPod|Android/.test(ua) || (typeof window !== 'undefined' && window.innerWidth < 768);

        // Prefer popup (works on many platforms). If popup fails (blocked) fall back to redirect which is more reliable on mobile/Safari.
        try {
            await signInWithPopup(this.auth, provider);
            return;
        } catch (err: any) {
            // If popup fails or is blocked, fallback to redirect
            await signInWithRedirect(this.auth, provider);
            return;
        }
    }

    // If the app was redirected back from Google sign-in, call this on init to complete sign-in.
    async completeRedirectSignIn(): Promise<any> {
        try {
            const res = await getRedirectResult(this.auth);
            return res;
        } catch (err) {
            // ignore no-redirect state or other errors; caller can handle
            return null;
        }
    }

    signOut(): Promise<void> {
        return signOut(this.auth);
    }
}
