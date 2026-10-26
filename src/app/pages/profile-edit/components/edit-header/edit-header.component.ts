import { Component, input } from '@angular/core';

@Component({
  selector: 'app-edit-header',
  imports: [],
  templateUrl: './edit-header.component.html',
  styleUrl: './edit-header.component.scss',
  standalone: true,
})
export class EditHeaderComponent {
  avatarUrl = input.required<string>();
}
