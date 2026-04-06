import { EstadoReserva } from "./EstadoReserva";
import { UsuarioModel } from "./usuario";

export interface ReservaModel {
  id?: number;
  fecha_reserva: string;
  estado: EstadoReserva;         
  usuario: UsuarioModel;
}