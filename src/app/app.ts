import { Component } from '@angular/core';
import { Navbar } from "./core/components/navbar/navbar";

@Component({
  selector: 'app-root',
  imports: [Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'mit-robinson-dk';
}
