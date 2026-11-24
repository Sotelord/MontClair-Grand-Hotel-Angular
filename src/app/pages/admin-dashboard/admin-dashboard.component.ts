import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReservationService } from '../../service/reservation.service';
import { RoomService } from '../../service/room.service';
import { RoomTypeService } from '../../service/room-type.service';
import { ServicesService } from '../../service/services.service';
import { ClientService } from '../../service/client.service';
import { ReservationDTO } from '../../models/reservation.model';
import { Room } from '../../models/room.model';
import { RoomType } from '../../models/roomType.model';
import { Service } from '../../models/service.model';
import { Client } from '../../models/client.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';

export interface RoomTypeKpi {
  typeId: number;
  name: string;
  baseRate: number;
  totalRooms: number;
  reservationsCount: number;
  nightsSold: number;
  revenue: number;
  sharePercent: number;
}

export interface ServiceKpi {
  name: string;
  quantitySold: number;
  revenue: number;
  sharePercent: number;
}

export interface VipClientKpi {
  clientId: number;
  fullName: string;
  email: string;
  tier: string;
  points: number;
  reservationsCount: number;
  totalSpent: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminPageHeaderComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);
  private servicesService = inject(ServicesService);
  private clientService = inject(ClientService);
  private router = inject(Router);

  isLoading = true;
  errorMessage: string | null = null;

  // Datos crudos desde las rutas existentes del backend
  allReservations: ReservationDTO[] = [];
  allRooms: Room[] = [];
  allRoomTypes: RoomType[] = [];
  allServices: Service[] = [];
  allClients: Client[] = [];

  // Filtros interactivos del dashboard
  selectedPeriod: 'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'NEXT_30_DAYS' = 'ALL';
  selectedRoomTypeFilter = 'ALL';

  // KPIs Financieros
  totalRevenue = 0;
  roomRevenue = 0;
  servicesRevenue = 0;
  roomRevenuePercent = 0;
  servicesRevenuePercent = 0;

  collectedRevenue = 0;
  pendingRevenue = 0;
  collectionRatePercent = 0;
  paidReservationsCount = 0;
  unpaidReservationsCount = 0;
  averageTicket = 0;

  // KPIs Hoteleros (ADR, RevPAR, ALOS, Ocupación)
  adr = 0; // Average Daily Rate
  revPar = 0; // Revenue Per Available Room
  averageStayNights = 0; // ALOS
  averageGuestsPerStay = 0;
  totalNightsSold = 0;
  totalGuestsHosted = 0;

  // Inventario físico y ocupación
  totalRoomsCount = 0;
  availableRoomsCount = 0;
  maintenanceRoomsCount = 0;
  occupiedRoomsNowCount = 0;
  occupancyRatePercent = 0;

  // Distribución por estado de reserva
  totalReservationsCount = 0;
  confirmedCount = 0;
  activeCount = 0;
  completedCount = 0;
  cancelledCount = 0;
  cancellationRatePercent = 0;

  // Tablas analíticas desglosadas
  roomTypeKpis: RoomTypeKpi[] = [];
  serviceKpis: ServiceKpi[] = [];
  vipClients: VipClientKpi[] = [];
  recentReservations: ReservationDTO[] = [];

  // Métricas de Clientes & Fidelización
  totalGuestClients = 0;
  imperialClientsCount = 0;
  privilegeClientsCount = 0;
  classicClientsCount = 0;
  totalLoyaltyPoints = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      reservations: this.reservationService.findAll().pipe(catchError(() => of([]))),
      rooms: this.roomService.findAll().pipe(catchError(() => of([]))),
      roomTypes: this.roomTypeService.findAll().pipe(catchError(() => of([]))),
      services: this.servicesService.findAll().pipe(catchError(() => of([]))),
      clients: this.clientService.findAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ reservations, rooms, roomTypes, services, clients }) => {
        this.allReservations = reservations || [];
        this.allRooms = rooms || [];
        this.allRoomTypes = roomTypes || [];
        this.allServices = services || [];
        this.allClients = clients || [];
        this.recalculateKpis();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible cargar los indicadores del hotel.';
        this.isLoading = false;
      },
    });
  }

  onFilterChange(): void {
    this.recalculateKpis();
  }

  recalculateKpis(): void {
    const filtered = this.getFilteredReservations();
    this.totalReservationsCount = filtered.length;

    this.confirmedCount = filtered.filter((r) => r.status === 'CONFIRMED').length;
    this.activeCount = filtered.filter((r) => r.status === 'ACTIVE').length;
    this.completedCount = filtered.filter((r) => r.status === 'INACTIVE').length;
    this.cancelledCount = filtered.filter((r) => r.status === 'CANCELLED').length;

    this.cancellationRatePercent =
      this.totalReservationsCount > 0
        ? Math.round((this.cancelledCount / this.totalReservationsCount) * 1000) / 10
        : 0;

    // Reservas válidas (no canceladas) para ingresos, ADR, RevPAR y estancias
    const validReservations = filtered.filter((r) => r.status !== 'CANCELLED');

    let roomRev = 0;
    let servRev = 0;
    let totalRev = 0;
    let collected = 0;
    let pending = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let nightsSum = 0;
    let guestsSum = 0;

    for (const res of validReservations) {
      const rSub = res.roomSubtotal ?? this.reservationService.calculateRoomSubtotal(res);
      const sSub = res.servicesSubtotal ?? this.reservationService.calculateServicesSubtotal(res);
      const tot = res.totalPrice ?? rSub + sSub;
      const nights = res.nights ?? this.reservationService.calculateNights(res.checkInDate, res.checkOutDate);

      roomRev += rSub;
      servRev += sSub;
      totalRev += tot;
      nightsSum += nights;
      guestsSum += res.numberOfPeople || 1;

      if (res.paid) {
        collected += tot;
        paidCount++;
      } else {
        const paidAmt = res.paidAmount || 0;
        const pendAmt = res.pendingBalance ?? Math.max(0, tot - paidAmt);
        collected += paidAmt;
        pending += pendAmt;
        unpaidCount++;
      }
    }

    this.roomRevenue = Math.round(roomRev * 100) / 100;
    this.servicesRevenue = Math.round(servRev * 100) / 100;
    this.totalRevenue = Math.round(totalRev * 100) / 100;

    this.roomRevenuePercent =
      this.totalRevenue > 0 ? Math.round((this.roomRevenue / this.totalRevenue) * 100) : 0;
    this.servicesRevenuePercent =
      this.totalRevenue > 0 ? 100 - this.roomRevenuePercent : 0;

    this.collectedRevenue = Math.round(collected * 100) / 100;
    this.pendingRevenue = Math.round(pending * 100) / 100;
    this.collectionRatePercent =
      this.totalRevenue > 0
        ? Math.round((this.collectedRevenue / this.totalRevenue) * 1000) / 10
        : 0;
    this.paidReservationsCount = paidCount;
    this.unpaidReservationsCount = unpaidCount;

    this.totalNightsSold = nightsSum;
    this.totalGuestsHosted = guestsSum;

    const validCount = validReservations.length;
    this.averageTicket = validCount > 0 ? Math.round((this.totalRevenue / validCount) * 100) / 100 : 0;
    this.averageStayNights = validCount > 0 ? Math.round((nightsSum / validCount) * 10) / 10 : 0;
    this.averageGuestsPerStay = validCount > 0 ? Math.round((guestsSum / validCount) * 10) / 10 : 0;

    // Inventario de habitaciones
    const filteredRooms =
      this.selectedRoomTypeFilter === 'ALL'
        ? this.allRooms
        : this.allRooms.filter(
            (r) =>
              String(r.roomType?.id) === this.selectedRoomTypeFilter ||
              r.roomType?.name === this.selectedRoomTypeFilter,
          );

    this.totalRoomsCount = filteredRooms.length;
    this.maintenanceRoomsCount = filteredRooms.filter((r) => r.status === 'MAINTENANCE').length;
    const operationalRooms = Math.max(1, this.totalRoomsCount - this.maintenanceRoomsCount);

    // Habitaciones ocupadas hoy (estancias ACTIVE o CONFIRMED que cubren la fecha actual)
    const todayIso = this.getTodayIso();
    const occupiedRoomIds = new Set<string | number>();
    for (const res of validReservations) {
      const isCurrentlyStaying =
        res.status === 'ACTIVE' ||
        (res.status === 'CONFIRMED' &&
          res.checkInDate <= todayIso &&
          res.checkOutDate >= todayIso);
      if (isCurrentlyStaying) {
        occupiedRoomIds.add(res.roomId || res.roomNumber || res.id);
      }
    }

    this.occupiedRoomsNowCount = Math.min(operationalRooms, occupiedRoomIds.size || this.activeCount);
    this.availableRoomsCount = Math.max(
      0,
      this.totalRoomsCount - this.maintenanceRoomsCount - this.occupiedRoomsNowCount,
    );
    this.occupancyRatePercent =
      this.totalRoomsCount > 0
        ? Math.min(100, Math.round((this.occupiedRoomsNowCount / operationalRooms) * 1000) / 10)
        : 0;

    // ADR (Tarifa Promedio Diaria) y RevPAR (Ingreso por Habitación Disponible)
    this.adr = this.totalNightsSold > 0 ? Math.round((this.roomRevenue / this.totalNightsSold) * 100) / 100 : 0;
    this.revPar =
      operationalRooms > 0 ? Math.round((this.roomRevenue / operationalRooms) * 100) / 100 : 0;

    this.computeRoomTypeBreakdown(validReservations);
    this.computeServiceBreakdown(validReservations);
    this.computeClientAndLoyaltyKpis(validReservations);

    // Últimas 6 reservas ordenadas de más reciente a más antigua
    this.recentReservations = [...filtered]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 6);
  }

  private computeRoomTypeBreakdown(validReservations: ReservationDTO[]): void {
    const map = new Map<string, RoomTypeKpi>();

    for (const type of this.allRoomTypes) {
      const roomsOfType = this.allRooms.filter((r) => r.roomType?.id === type.id).length;
      map.set(type.name.toLowerCase(), {
        typeId: type.id,
        name: type.name,
        baseRate: type.pricePerNight || 0,
        totalRooms: roomsOfType,
        reservationsCount: 0,
        nightsSold: 0,
        revenue: 0,
        sharePercent: 0,
      });
    }

    for (const res of validReservations) {
      const key = (res.roomTypeName || 'Categoría General').toLowerCase();
      let entry = map.get(key);
      if (!entry) {
        entry = {
          typeId: res.roomTypeId || 0,
          name: res.roomTypeName || 'Categoría General',
          baseRate: res.pricePerNight || 0,
          totalRooms: 0,
          reservationsCount: 0,
          nightsSold: 0,
          revenue: 0,
          sharePercent: 0,
        };
        map.set(key, entry);
      }
      const rSub = res.roomSubtotal ?? this.reservationService.calculateRoomSubtotal(res);
      const nights = res.nights ?? this.reservationService.calculateNights(res.checkInDate, res.checkOutDate);

      entry.reservationsCount++;
      entry.nightsSold += nights;
      entry.revenue = Math.round((entry.revenue + rSub) * 100) / 100;
    }

    const totalRoomRev = Math.max(1, this.roomRevenue);
    this.roomTypeKpis = Array.from(map.values())
      .map((item) => ({
        ...item,
        sharePercent: this.roomRevenue > 0 ? Math.round((item.revenue / totalRoomRev) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private computeServiceBreakdown(validReservations: ReservationDTO[]): void {
    const map = new Map<string, { name: string; quantitySold: number; revenue: number }>();

    for (const s of this.allServices) {
      if ((s.price || 0) > 0) {
        map.set(s.name.toLowerCase(), {
          name: s.name,
          quantitySold: 0,
          revenue: 0,
        });
      }
    }

    for (const res of validReservations) {
      for (const acq of res.services || []) {
        const key = (acq.name || 'Servicio').toLowerCase();
        const sub = acq.subtotal ?? acq.quantity * acq.unitPrice;
        const current = map.get(key) || {
          name: acq.name || 'Servicio',
          quantitySold: 0,
          revenue: 0,
        };
        current.quantitySold += acq.quantity || 1;
        current.revenue = Math.round((current.revenue + sub) * 100) / 100;
        map.set(key, current);
      }
    }

    const totalServRev = Math.max(1, this.servicesRevenue);
    this.serviceKpis = Array.from(map.values())
      .map((item) => ({
        ...item,
        sharePercent: this.servicesRevenue > 0 ? Math.round((item.revenue / totalServRev) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.quantitySold - a.quantitySold);
  }

  private computeClientAndLoyaltyKpis(validReservations: ReservationDTO[]): void {
    const guestClients = this.allClients.filter(
      (c) => !c.role || c.role.toUpperCase() === 'CLIENT',
    );
    this.totalGuestClients = guestClients.length || this.allClients.length;

    this.imperialClientsCount = guestClients.filter((c) => c.loyaltyTier === 'IMPERIAL').length;
    this.privilegeClientsCount = guestClients.filter((c) => c.loyaltyTier === 'PRIVILEGE').length;
    this.classicClientsCount =
      this.totalGuestClients - this.imperialClientsCount - this.privilegeClientsCount;

    this.totalLoyaltyPoints = this.allClients.reduce((acc, c) => acc + (c.points || 0), 0);

    const spendByClient = new Map<number, { count: number; spent: number; name: string; email: string }>();

    for (const res of validReservations) {
      const cId = res.clientId || 0;
      if (!cId) continue;
      const prev = spendByClient.get(cId) || {
        count: 0,
        spent: 0,
        name: `${res.clientFirstName || ''} ${res.clientLastName || ''}`.trim() || 'Huésped',
        email: res.clientEmail || '',
      };
      prev.count++;
      prev.spent = Math.round((prev.spent + (res.totalPrice || 0)) * 100) / 100;
      spendByClient.set(cId, prev);
    }

    const vipList: VipClientKpi[] = [];
    spendByClient.forEach((data, clientId) => {
      const clientObj = this.allClients.find((c) => c.id === clientId);
      vipList.push({
        clientId,
        fullName:
          clientObj
            ? `${clientObj.firstName} ${clientObj.lastName || ''}`.trim()
            : data.name,
        email: clientObj?.email || data.email,
        tier: clientObj?.loyaltyTierLabel || clientObj?.loyaltyTier || 'CLASSIC',
        points: clientObj?.points || 0,
        reservationsCount: data.count,
        totalSpent: data.spent,
      });
    });

    this.vipClients = vipList
      .sort((a, b) => b.totalSpent - a.totalSpent || b.reservationsCount - a.reservationsCount)
      .slice(0, 5);
  }

  private getFilteredReservations(): ReservationDTO[] {
    let list = [...this.allReservations];

    if (this.selectedRoomTypeFilter !== 'ALL') {
      list = list.filter(
        (r) =>
          String(r.roomTypeId) === this.selectedRoomTypeFilter ||
          r.roomTypeName === this.selectedRoomTypeFilter,
      );
    }

    if (this.selectedPeriod === 'ALL') {
      return list;
    }

    const now = new Date();
    const todayIso = this.getTodayIso();

    if (this.selectedPeriod === 'THIS_MONTH') {
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return list.filter(
        (r) => r.checkInDate?.startsWith(ym) || r.checkOutDate?.startsWith(ym),
      );
    }

    if (this.selectedPeriod === 'LAST_30_DAYS') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      const pastIso = this.toIso(past);
      return list.filter((r) => r.checkInDate >= pastIso && r.checkInDate <= todayIso);
    }

    if (this.selectedPeriod === 'NEXT_30_DAYS') {
      const future = new Date();
      future.setDate(now.getDate() + 30);
      const futureIso = this.toIso(future);
      return list.filter((r) => r.checkInDate >= todayIso && r.checkInDate <= futureIso);
    }

    return list;
  }

  private getTodayIso(): string {
    return this.toIso(new Date());
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0) + ' €';
  }

  getStatusPercentage(count: number): number {
    if (this.totalReservationsCount <= 0) return 0;
    return Math.round((count / this.totalReservationsCount) * 100);
  }

  navigateToNewReservation(): void {
    this.router.navigate(['/admin/reservations/new']);
  }
}
