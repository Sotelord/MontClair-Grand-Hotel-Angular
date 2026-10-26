import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoomType } from '../../../../models/roomType.model';

@Component({
  selector: 'app-category-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './category-fields.component.html',
  styleUrl: './category-fields.component.scss',
  standalone: true,
})
export class CategoryFieldsComponent {
  form = input.required<FormGroup>();
  roomTypes = input.required<RoomType[]>();
}
