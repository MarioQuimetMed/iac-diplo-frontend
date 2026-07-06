export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface CreateReservationDto {
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}
