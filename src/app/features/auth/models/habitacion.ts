import { CategoriaHabitacion } from "./categoria-habitacion";
import { EstadoReserva } from "./habitacionEstado";
import { RolTipo } from "./roltipo";
export interface Habitacion {
  id_habitacion?: number;
  nombre_habitacion: string;
  descripcion_habitacion: string;
  estado: EstadoReserva;
  tipo: RolTipo;
  categoriaHabitacion: CategoriaHabitacion;
}
