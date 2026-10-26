import { Component } from '@angular/core';
import { InfoCardComponent } from '../info-card/info-card.component';

@Component({
  selector: 'app-address-card',
  imports: [InfoCardComponent],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.scss',
  standalone: true,
})
export class AddressCardComponent {}
