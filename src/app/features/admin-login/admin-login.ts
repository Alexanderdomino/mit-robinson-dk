import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule],
    template: `
    <div class="login-wrap">
      <mat-card>
        <h2>Admin login</h2>
        <p>Kun adgang for kongen</p>
        <button mat-raised-button color="primary" (click)="signIn()">Log ind med Google</button>
      </mat-card>
    </div>
  `,
    styles: [`.login-wrap { display:flex; align-items:center; justify-content:center; min-height:60vh } mat-card{padding:24px}`]
})
export class AdminLogin {
    constructor(private auth: AuthService, private router: Router) { }

    async ngOnInit(): Promise<void> {
        // complete redirect-based sign-in if coming back from Google
        const res = await this.auth.completeRedirectSignIn();
        const user = res?.user ?? null;
        if (user) {
            // navigate - guard will check email
            this.router.navigate(['/admin']);
        }
    }

    async signIn(): Promise<void> {
        try {
            await this.auth.signInWithGoogle();
            // popup flow will resolve here; redirect flow will be handled in ngOnInit after redirect
            // If popup succeeded, navigate to admin immediately (guard will check admin email)
            this.router.navigate(['/admin']);
        } catch (err) {
            console.error('Login failed', err);
        }
    }
}
