import { Component, Input } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @Input() title = '';

  constructor(private router: Router) {}

  onLogoClick() {
    this.router.navigate(['/']);
  }
}
