import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  routes = [
    { label: 'Hjem', path: '/' },
    { label: 'Radler', path: '/radler' }
  ];

  sidenavOpen = false;
  scrolled = false;
  private boundOnScroll = this.onScroll.bind(this);

  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigate(['/']);
    this.sidenavOpen = false;
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.boundOnScroll, { passive: true });
      // initialize state
      this.scrolled = (window.scrollY || 0) > 8;
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.boundOnScroll);
    }
  }

  private onScroll(): void {
    const y = window.scrollY || 0;
    const should = y > 2; // small threshold
    if (should !== this.scrolled) {
      this.scrolled = should;
    }
  }
}
