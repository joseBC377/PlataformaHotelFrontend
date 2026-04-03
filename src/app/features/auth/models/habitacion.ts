import { CategoriaHabitacion } from "./categoria-habitacion";
import { EstadoReserva } from "./habitacionEstado";
export interface Habitacion {
  id?: number;
  nombre: string;
  descripcion: string;
  estado: EstadoReserva;
  categoriaHabitacion: CategoriaHabitacion;
}
