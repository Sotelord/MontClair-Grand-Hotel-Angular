export interface Reservation {
  id: number;
  clientId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople: number;
  status: string;
}
