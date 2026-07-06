import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { CreateReservationDto, Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private readonly baseUrl = `${API_BASE_URL}reservations`;

  constructor(private readonly http: HttpClient) {}

  createReservation(payload: CreateReservationDto): Observable<Reservation> {
    return this.http.post<Reservation>(this.baseUrl, payload);
  }

  findReservation(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.baseUrl}/${id}`);
  }
}
