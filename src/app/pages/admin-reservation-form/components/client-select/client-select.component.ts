import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Client } from '../../../../models/client.model';

@Component({
  selector: 'app-client-select',
  imports: [ReactiveFormsModule],
  templateUrl: './client-select.component.html',
  styleUrl: './client-select.component.scss',
  standalone: true,
})
export class ClientSelectComponent {
  form = input.required<FormGroup>();
  clients = input.required<Client[]>();
}
