import { EstadoReserva } from "./EstadoReserva";
import { PagoModel } from "./pago";
import { UsuarioModel } from "./usuario";

export interface ReservaModel {
  id_reserva?: number;
  fechaCreacion: string;
  estado: EstadoReserva;
  usuario: UsuarioModel;
  pago?: PagoModel; // objeto completo
}

