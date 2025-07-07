import { CategoriaHabitacion } from "./categoria_habitacion";

export interface Habitacion {
  id_habitacion?: number;
  nombre: string;
  descripcion: string;
  estado: string;
  categoria_habitacion: CategoriaHabitacion;
}
