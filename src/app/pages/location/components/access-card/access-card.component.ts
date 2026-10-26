import { Component } from '@angular/core';
import { InfoCardComponent } from '../info-card/info-card.component';

@Component({
  selector: 'app-access-card',
  imports: [InfoCardComponent],
  templateUrl: './access-card.component.html',
  styleUrl: './access-card.component.scss',
  standalone: true,
})
export class AccessCardComponent {}
