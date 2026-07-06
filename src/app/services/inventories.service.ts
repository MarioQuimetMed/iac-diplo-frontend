import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root',
})
export class InventoriesService {
  private readonly baseUrl = `${API_BASE_URL}inventories`;

  constructor(private readonly http: HttpClient) {}

  findRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`);
  }
}
