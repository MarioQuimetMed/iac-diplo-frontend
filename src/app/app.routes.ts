import { Routes } from '@angular/router';
import { CreateReservation } from './pages/create-reservation/create-reservation';
import { ReservationDetail } from './pages/reservation-detail/reservation-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reservations/new' },
  { path: 'reservations/new', component: CreateReservation },
  { path: 'reservations/search', component: ReservationDetail },
  { path: 'reservations/:id', component: ReservationDetail },
  { path: '**', redirectTo: 'reservations/new' },
];
