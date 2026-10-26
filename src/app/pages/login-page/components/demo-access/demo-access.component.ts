import { Component, output } from '@angular/core';

@Component({
  selector: 'app-demo-access',
  imports: [],
  templateUrl: './demo-access.component.html',
  styleUrl: './demo-access.component.scss',
  standalone: true,
})
export class DemoAccessComponent {
  selected = output<'admin' | 'demo'>();
}
