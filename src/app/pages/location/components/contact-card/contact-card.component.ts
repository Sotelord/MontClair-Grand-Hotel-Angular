import { Component } from '@angular/core';
import { InfoCardComponent } from '../info-card/info-card.component';

@Component({
  selector: 'app-contact-card',
  imports: [InfoCardComponent],
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.scss',
  standalone: true,
})
export class ContactCardComponent {}
