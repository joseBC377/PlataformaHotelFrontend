import { Habitacion } from "./habitacion";
import { ReservaModel } from "./reserva";

export interface ReservaHabitacion {
  id_reserva_habitacion?: number;
  fechaInicio: string;
  fechaFin: string;
  precioUnitario: number;
  reserva?: ReservaModel;
  habitacion?: Habitacion;
}
