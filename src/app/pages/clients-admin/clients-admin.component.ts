import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { Client } from '../../models/client.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-clients-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent],
  templateUrl: './clients-admin.component.html',
  styleUrl: './clients-admin.component.scss',
})
export class ClientsAdminComponent implements OnInit {
  private clientService = inject(ClientService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  clients: Client[] = [];
  searchTerm: string = '';
  selectedRole: string = 'ALL';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  clientToDelete: Client | null = null;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.findAll().subscribe({
      next: (data) => {
        this.clients = data || [];
      },
      error: () => {
        this.clients = [];
      },
    });
  }

  get filteredClients(): Client[] {
    return this.clients.filter((client) => {
      const query = this.searchTerm.toLowerCase();
      const matchSearch =
        !this.searchTerm ||
        client.firstName.toLowerCase().includes(query) ||
        (client.lastName && client.lastName.toLowerCase().includes(query)) ||
        client.username.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query);

      const matchRole =
        this.selectedRole === 'ALL' ||
        client.role?.toUpperCase() === this.selectedRole;

      return matchSearch && matchRole;
    });
  }

  onAddClient(): void {
    this.router.navigate(['/admin/clients/add']);
  }

  onEditClient(id: number): void {
    this.router.navigate(['/admin/clients/edit', id]);
  }

  confirmDelete(client: Client): void {
    this.clientToDelete = client;
  }

  cancelDelete(): void {
    this.clientToDelete = null;
  }

  executeDelete(): void {
    if (!this.clientToDelete) return;
    if (this.reservationService.hasClientReservations(this.clientToDelete.id)) {
      this.errorMessage = `No se puede eliminar el cliente '${this.clientToDelete.firstName} ${this.clientToDelete.lastName || ''}' porque tiene reservaciones registradas en el sistema.`;
      this.clientToDelete = null;
      setTimeout(() => (this.errorMessage = null), 6000);
      return;
    }

    const clientName = this.clientToDelete.firstName;
    const clientId = this.clientToDelete.id;
    this.clientToDelete = null;

    this.clientService.delete(clientId).subscribe({
      next: () => {
        this.successMessage = `Cliente '${clientName}' eliminado correctamente.`;
        this.loadClients();
        setTimeout(() => (this.successMessage = null), 4000);
      },
      error: () => {
        this.errorMessage = 'Error al eliminar el cliente.';
        setTimeout(() => (this.errorMessage = null), 6000);
      },
    });
  }

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }
}
