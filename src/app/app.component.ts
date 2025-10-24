import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./meteologica/components/navbar/navbar.component";
import { ClockComponent } from "./meteologica/components/clock/clock.component";
import { FooterComponent } from "./meteologica/components/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ClockComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prueba tecnica-meteologica';
}
