import { Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  imports: [FormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  standalone: true,
})
export class LoginFormComponent {
  identifier = model<string>('');
  password = model<string>('');
  submitted = output<void>();
}
