import { Component, input } from '@angular/core';
import { TransferOption } from '../../../../models/location.model';

@Component({
  selector: 'app-transfer-card',
  imports: [],
  templateUrl: './transfer-card.component.html',
  styleUrl: './transfer-card.component.scss',
  standalone: true,
})
export class TransferCardComponent {
  transfer = input.required<TransferOption>();
}
