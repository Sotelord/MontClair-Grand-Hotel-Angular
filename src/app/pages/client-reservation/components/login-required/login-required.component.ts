import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-required',
  imports: [RouterLink],
  templateUrl: './login-required.component.html',
  styleUrl: './login-required.component.scss',
  standalone: true,
})
export class LoginRequiredComponent {}
