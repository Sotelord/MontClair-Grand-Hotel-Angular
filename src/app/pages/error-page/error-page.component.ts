import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ErrorIconComponent } from './components/error-icon/error-icon.component';
import { OrnamentDividerComponent } from '../../components/ornament-divider/ornament-divider.component';
import { ErrorActionsComponent } from './components/error-actions/error-actions.component';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [
    ErrorIconComponent,
    OrnamentDividerComponent,
    ErrorActionsComponent,
  ],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  errorMessage: string =
    'No fue posible completar la solicitud o el recurso solicitado no existe.';

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
