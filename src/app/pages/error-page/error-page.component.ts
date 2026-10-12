import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  errorMessage: string = 'No fue posible completar la solicitud o el recurso solicitado no existe.';

  ngOnInit(): void {
    const msg = this.route.snapshot.queryParamMap.get('mensaje');
    if (msg) {
      this.errorMessage = msg;
    }
  }

  goBack(): void {
    this.location.back();
  }
}
