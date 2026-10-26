import { Component, output } from '@angular/core';

@Component({
  selector: 'app-row-actions',
  imports: [],
  templateUrl: './row-actions.component.html',
  styleUrl: './row-actions.component.scss',
  standalone: true,
})
export class RowActionsComponent {
  viewClicked = output<void>();
  editClicked = output<void>();
  deleteClicked = output<void>();
}
