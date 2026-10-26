import { Component } from '@angular/core';
import { OrnamentDividerComponent } from '../../../../components/ornament-divider/ornament-divider.component';

@Component({
  selector: 'app-login-header',
  imports: [OrnamentDividerComponent],
  templateUrl: './login-header.component.html',
  styleUrl: './login-header.component.scss',
  standalone: true,
})
export class LoginHeaderComponent {}
