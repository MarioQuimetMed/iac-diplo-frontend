import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Reservation } from '../../models/reservation.model';
import { ReservationsService } from '../../services/reservations.service';

@Component({
  selector: 'app-reservation-detail',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './reservation-detail.html',
  styleUrl: './reservation-detail.scss',
})
export class ReservationDetail implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationsService = inject(ReservationsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly reservation = signal<Reservation | null>(null);
  readonly loading = signal(false);
  readonly statusText: Record<string, string> = {
    PENDING: 'Solicitud en revision',
    CONFIRMED: 'Reserva confirmada',
    REJECTED: 'Sin disponibilidad',
  };

  readonly form = this.fb.nonNullable.group({
    id: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.form.controls.id.setValue(id);
      this.search();
    }
  }

  search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.resolveReservationId(this.form.controls.id.value.trim());
    this.loading.set(true);
    this.reservationsService.findReservation(id).subscribe({
      next: (reservation) => {
        this.reservation.set(reservation);
        this.form.controls.id.setValue(this.reservationCode(reservation), { emitEvent: false });
        this.loading.set(false);
        this.router.navigate(['/reservations', reservation.id], { replaceUrl: true });
      },
      error: () => {
        this.reservation.set(null);
        this.loading.set(false);
        this.snackBar.open('No se encontro la reserva', 'Cerrar', { duration: 4000 });
      },
    });
  }

  refresh(): void {
    this.search();
  }

  statusLabel(status: string): string {
    return this.statusText[status] ?? status;
  }

  statusClass(status: string): string {
    if (status === 'CONFIRMED') {
      return 'confirmed';
    }

    if (status === 'REJECTED') {
      return 'rejected';
    }

    return 'pending';
  }

  statusTitle(status: string): string {
    const titles: Record<string, string> = {
      PENDING: 'Estamos revisando tu solicitud',
      CONFIRMED: 'Tu reserva esta confirmada',
      REJECTED: 'No hay disponibilidad para esas fechas',
    };

    return titles[status] ?? 'Estado de tu reserva';
  }

  statusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      PENDING: 'Recibimos tu solicitud y estamos validando la disponibilidad de la habitacion.',
      CONFIRMED: 'Tu estadia fue confirmada. Te esperamos en Hotel Zoka.',
      REJECTED: 'No encontramos disponibilidad en el rango seleccionado. Puedes intentar con otras fechas.',
    };

    return descriptions[status] ?? 'Consulta el estado actualizado de tu estadia.';
  }

  reservationCode(reservation: Reservation): string {
    return reservation.id.slice(0, 8).toUpperCase();
  }

  reservationDates(reservation: Reservation): string {
    return `${this.formatDate(reservation.checkInDate)} al ${this.formatDate(reservation.checkOutDate)}`;
  }

  private resolveReservationId(value: string): string {
    const normalized = value.toUpperCase();
    return localStorage.getItem(`reservation:${normalized}`) ?? value;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
