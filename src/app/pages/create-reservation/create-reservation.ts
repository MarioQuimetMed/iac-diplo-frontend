import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Reservation } from '../../models/reservation.model';
import { Room } from '../../models/room.model';
import { InventoriesService } from '../../services/inventories.service';
import { ReservationsService } from '../../services/reservations.service';

@Component({
  selector: 'app-create-reservation',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './create-reservation.html',
  styleUrl: './create-reservation.scss',
})
export class CreateReservation implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoriesService = inject(InventoriesService);
  private readonly router = inject(Router);
  private readonly reservationsService = inject(ReservationsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly createdReservation = signal<Reservation | null>(null);
  readonly loading = signal(false);
  readonly loadingRooms = signal(false);
  readonly rooms = signal<Room[]>([]);
  readonly minDate = new Date();

  readonly form = this.fb.group({
    roomId: this.fb.nonNullable.control('', [Validators.required]),
    guestName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    guestEmail: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    checkInDate: this.fb.control<Date | null>(null, [Validators.required]),
    checkOutDate: this.fb.control<Date | null>(null, [Validators.required]),
  });

  readonly statusText: Record<string, string> = {
    PENDING: 'Solicitud en revision',
    CONFIRMED: 'Reserva confirmada',
    REJECTED: 'Sin disponibilidad',
  };

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loadingRooms.set(true);
    this.inventoriesService.findRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms.filter((room) => room.isActive));
        this.loadingRooms.set(false);
      },
      error: () => {
        this.rooms.set([]);
        this.loadingRooms.set(false);
        this.snackBar.open('No se pudieron cargar las habitaciones', 'Cerrar', { duration: 4000 });
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (!raw.checkInDate || !raw.checkOutDate) {
      return;
    }

    if (raw.checkOutDate <= raw.checkInDate) {
      this.snackBar.open('El check-out debe ser posterior al check-in', 'Cerrar', { duration: 4000 });
      return;
    }

    const payload = {
      roomId: raw.roomId,
      guestName: raw.guestName,
      guestEmail: raw.guestEmail,
      checkInDate: this.formatDate(raw.checkInDate),
      checkOutDate: this.formatDate(raw.checkOutDate),
    };

    this.loading.set(true);
    this.reservationsService.createReservation(payload).subscribe({
      next: (reservation) => {
        this.createdReservation.set(reservation);
        this.saveReservationCode(reservation);
        this.loading.set(false);
        this.snackBar.open('Solicitud enviada', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/reservations', this.reservationCode(reservation)]);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo crear la reserva', 'Cerrar', { duration: 4000 });
      },
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  reservationCode(reservation: Reservation): string {
    return reservation.id.slice(0, 8).toUpperCase();
  }

  statusLabel(status: string): string {
    return this.statusText[status] ?? status;
  }

  selectedRoomLabel(): string {
    const roomId = this.form.controls.roomId.value;
    const room = this.rooms().find((item) => item.id === roomId);

    return room ? `${room.type} · Habitacion ${room.roomNumber}` : 'Aun no seleccionada';
  }

  guestLabel(): string {
    return this.form.controls.guestName.value.trim() || 'Pendiente';
  }

  dateRangeLabel(): string {
    const checkInDate = this.form.controls.checkInDate.value;
    const checkOutDate = this.form.controls.checkOutDate.value;

    if (!checkInDate || !checkOutDate) {
      return 'Pendiente';
    }

    return `${this.formatDisplayDate(checkInDate)} al ${this.formatDisplayDate(checkOutDate)}`;
  }

  private saveReservationCode(reservation: Reservation): void {
    localStorage.setItem(`reservation:${this.reservationCode(reservation)}`, reservation.id);
  }

  private formatDisplayDate(date: Date): string {
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
