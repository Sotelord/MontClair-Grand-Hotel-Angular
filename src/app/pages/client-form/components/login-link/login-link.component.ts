import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-link',
  imports: [RouterLink],
  templateUrl: './login-link.component.html',
  styleUrl: './login-link.component.scss',
  standalone: true,
})
export class LoginLinkComponent {}
