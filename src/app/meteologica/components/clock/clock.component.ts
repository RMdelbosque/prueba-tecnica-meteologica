import { Component, inject } from '@angular/core';
import { ClockService } from '../../services/clock.service';

@Component({
  selector: 'clock',
  templateUrl: './clock.component.html',
})
export class ClockComponent {
  private clock = inject(ClockService);
  currentTime = this.clock.currentTime;
}
